import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const employeeSchema = z.object({
    first_name: z.string().min(1).max(255),
    last_name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    office_phone: z.string().max(20).optional().nullable(),
    private_phone: z.string().max(20).optional().nullable(),
    department_id: z.number().optional().nullable(),
    designation_id: z.number().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
});

export async function GET(request: Request) {
    try {
        const employees = await prisma.employees.findMany({
            orderBy: { first_name: 'asc' },
            include: {
                department: true,
                designation: true
            }
        });

        const employeesWithRoles = await Promise.all(employees.map(async (e: any) => {
            const user = await prisma.users.findFirst({
                where: { employee_id: Number(e.employee_id) },
                include: { role: true }
            });

            return {
                employee_id: e.employee_id.toString(),
                first_name: e.first_name,
                last_name: e.last_name,
                email: e.email,
                office_phone: e.office_phone,
                private_phone: e.private_phone,
                department_id: e.department_id ? e.department_id.toString() : null,
                designation_id: e.designation_id ? e.designation_id.toString() : null,
                created_at: e.created_at,
                updated_at: e.updated_at,
                department_name: e.department?.department,
                designation_name: e.designation?.designation,
                status: e.status,
                role: user?.role ? {
                    id: user.role.id.toString(),
                    name: user.role.name,
                    slug: user.role.slug,
                } : null,
                role_id: user?.role_id ? user.role_id.toString() : null
            };
        }));

        return NextResponse.json({ success: true, data: employeesWithRoles });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch employees', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.users.findUnique({
            where: { id: BigInt(session.user.id) },
            include: { role: true },
        });

        const isAdmin = user?.role?.slug === 'admin' || user?.role_id === BigInt(1);

        if (!isAdmin) {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Only admins can create employees' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validated = employeeSchema.parse(body);

        // Check unique email
        const existing = await prisma.employees.findFirst({
            where: { email: validated.email }
        });
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: { email: ['The email has already been taken.'] } },
                { status: 422 }
            );
        }

        // Create employee and user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Employee
            const newEmployee = await tx.employees.create({
                data: {
                    first_name: validated.first_name,
                    last_name: validated.last_name,
                    email: validated.email,
                    office_phone: validated.office_phone,
                    private_phone: validated.private_phone,
                    department_id: validated.department_id ? BigInt(validated.department_id) : null,
                    designation_id: validated.designation_id ? BigInt(validated.designation_id) : null,
                    status: validated.status || 'inactive',
                    created_at: new Date(),
                    updated_at: new Date()
                },
            });

            // 2. Create corresponding User account
            // Default password: "Password@123" (should be changed by user)
            const hashedPassword = await bcrypt.hash('Password@123', 10);

            await tx.users.create({
                data: {
                    name: `${validated.first_name} ${validated.last_name}`,
                    email: validated.email,
                    password: hashedPassword,
                    employee_id: Number(newEmployee.employee_id), // Link to employee
                    status: 'active',
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });

            return newEmployee;
        });

        const safeEmployee = JSON.parse(JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(
            { success: true, message: 'Employee created successfully', data: safeEmployee },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create employee', error: error.message },
            { status: 500 }
        );
    }
}
