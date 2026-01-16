import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const taskSchema = z.object({
    task_name: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    task_priority: z.number().int(),
    project_id: z.number().optional().nullable(),
    module_id: z.number().optional().nullable(),
    object_id: z.number().optional().nullable(),
    sub_object_id: z.number().optional().nullable(),
    department_id: z.number().optional().nullable(),
    assigned_to: z.number().optional().nullable(), // User ID
    due_date: z.string().optional().nullable(), // ISO Date string
    task_type: z.enum(['self_assign', 'assign_to_others', 'public']).optional(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employee_id');
        const status = searchParams.get('status'); // Optional status filter

        let whereClause: any = {};
        if (employeeId) {
            whereClause.assigned_to = BigInt(employeeId);
        }

        const tasks = await prisma.tasks.findMany({
            where: whereClause,
            include: {
                project: true,
                module: true,
                object: true,
                department: true,
                assigned_user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 100 // Safety limit
        });

        // Handle BigInt serialization
        const safeTasks = JSON.parse(JSON.stringify(tasks, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeTasks });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch tasks', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = taskSchema.parse(body);

        // Create Task
        const newTask = await prisma.tasks.create({
            data: {
                task_name: validated.task_name,
                description: validated.description,
                task_priority: validated.task_priority,
                project_id: validated.project_id ? BigInt(validated.project_id) : null,
                module_id: validated.module_id ? BigInt(validated.module_id) : null,
                object_id: validated.object_id ? BigInt(validated.object_id) : null,
                sub_object_id: validated.sub_object_id ? BigInt(validated.sub_object_id) : null,
                department_id: validated.department_id ? BigInt(validated.department_id) : null,
                assigned_to: validated.assigned_to ? BigInt(validated.assigned_to) : null,
                due_date: validated.due_date ? new Date(validated.due_date) : null,
                task_type: (validated.task_type as any) || 'assign_to_others',
                created_at: new Date(),
                updated_at: new Date()
            },
        });

        // If assigned to a user, create a TaskAssignment (if logic dictates)
        // For now, mirroring simple creation. Can extend to create taskassignments entry if needed.

        const safeTask = JSON.parse(JSON.stringify(newTask, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(
            { success: true, message: 'Task created successfully', data: safeTask },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create task', error: error.message },
            { status: 500 }
        );
    }
}
