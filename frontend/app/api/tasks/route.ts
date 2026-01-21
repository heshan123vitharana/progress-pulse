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
    assigned_to: z.number().optional().nullable(),
    due_date: z.string().optional().nullable(),
    task_type: z.enum(['self_assign', 'assign_to_others', 'public']).optional(),
    task_category: z.string().optional().default('customer'),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employee_id');
        const status = searchParams.get('status');
        const taskType = searchParams.get('task_type'); // Support public/assign_to_others

        let whereClause: any = {};
        if (employeeId) {
            whereClause.assigned_to = BigInt(employeeId);
        }
        if (taskType === 'public') {
            whereClause.task_type = 'public';
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
            take: 100
        });

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

        let taskCode: string | null = null;
        if (validated.project_id) {
            const project = await prisma.projects.findUnique({
                where: { project_id: BigInt(validated.project_id) }
            });

            if (project && project.project_code) {
                const tasksCount = await prisma.tasks.count({
                    where: { project_id: BigInt(validated.project_id) }
                });
                // Format: PRJ-CODE/0001 (Sequence + 1)
                // Padding 4 digits
                const seq = (tasksCount + 1).toString().padStart(4, '0');
                taskCode = `${project.project_code}/${seq}`;
            }
        }

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
                task_category: validated.task_category || 'customer',
                task_code: taskCode,
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
