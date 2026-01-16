import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation Schema matches DepartmentController.php
const departmentSchema = z.object({
    department_name: z.string().min(1).max(255), // Maps to 'department'
    description: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']),
});

export async function GET() {
    try {
        const departments = await prisma.departments.findMany({
            orderBy: { department: 'asc' }, // Matches orderBy('department')
        });
        const safeDepartments = JSON.parse(JSON.stringify(departments, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        // Map to match frontend interface
        const mappedDepartments = safeDepartments.map((d: any) => ({
            ...d,
            department_name: d.department
        }));

        return NextResponse.json({ success: true, data: mappedDepartments });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch departments', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = departmentSchema.parse(body);

        // Check uniqueness (Laravel: unique:departments,department)
        const existing = await prisma.departments.findFirst({
            where: { department: validated.department_name }
        });
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: { department_name: ['The department name has already been taken.'] } },
                { status: 422 }
            );
        }

        const newDept = await prisma.departments.create({
            data: {
                department: validated.department_name,
                description: validated.description,
                status: validated.status as any, // enum cast
            },
        });

        const safeNewDept = JSON.parse(JSON.stringify(newDept, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(
            { success: true, message: 'Department created successfully', data: safeNewDept },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create department', error: error.message },
            { status: 500 }
        );
    }
}
