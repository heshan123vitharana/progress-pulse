import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const employeeSchema = z.object({
    first_name: z.string().min(1).max(255).optional(),
    last_name: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional(),
    office_phone: z.string().max(20).optional().nullable(),
    private_phone: z.string().max(20).optional().nullable(),
    department_id: z.number().optional().nullable(),
    designation_id: z.number().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        const employee = await prisma.employees.findUnique({
            where: { employee_id: id },
            include: {
                department: true,
                designation: true
            }
        });

        if (!employee) {
            return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
        }

        const formattedEmployee = {
            employee_id: employee.employee_id.toString(),
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            office_phone: employee.office_phone,
            private_phone: employee.private_phone,
            department_id: employee.department_id ? employee.department_id.toString() : null,
            designation_id: employee.designation_id ? employee.designation_id.toString() : null,
            created_at: employee.created_at,
            updated_at: employee.updated_at,
            department_name: employee.department?.department,
            designation_name: employee.designation?.designation,
            status: employee.status
        };

        return NextResponse.json({ success: true, data: formattedEmployee });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to fetch employee', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);
        const body = await request.json();
        const validated = employeeSchema.parse(body);

        const existing = await prisma.employees.findUnique({ where: { employee_id: id } });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
        }

        // Check unique email excluding current
        if (validated.email) {
            const duplicate = await prisma.employees.findFirst({
                where: {
                    email: validated.email,
                    NOT: { employee_id: id }
                }
            });
            if (duplicate) {
                return NextResponse.json(
                    { success: false, message: 'Validation failed', errors: { email: ['The email has already been taken.'] } },
                    { status: 422 }
                );
            }
        }

        const updated = await prisma.employees.update({
            where: { employee_id: id },
            data: {
                first_name: validated.first_name,
                last_name: validated.last_name,
                email: validated.email,
                office_phone: validated.office_phone,
                private_phone: validated.private_phone,
                department_id: validated.department_id ? BigInt(validated.department_id) : undefined,
                designation_id: validated.designation_id ? BigInt(validated.designation_id) : undefined,
                status: validated.status,
                updated_at: new Date()
            }
        });

        const safeUpdated = JSON.parse(JSON.stringify(updated, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, message: 'Employee updated successfully', data: safeUpdated });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to update employee', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        await prisma.employees.delete({ where: { employee_id: id } });
        return NextResponse.json({ success: true, message: 'Employee deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to delete employee', error: error.message }, { status: 500 });
    }
}
