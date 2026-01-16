import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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

        const formattedEmployees = employees.map((e: any) => ({
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
            status: e.status
        }));

        return NextResponse.json({ success: true, data: formattedEmployees });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch employees', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
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

        const newEmployee = await prisma.employees.create({
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

        const safeEmployee = JSON.parse(JSON.stringify(newEmployee, (key, value) =>
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
