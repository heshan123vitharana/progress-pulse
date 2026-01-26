import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const taskSchema = z.object({
    task_name: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    task_priority: z.preprocess((val) => Number(val), z.number().int()),
    project_id: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().optional().nullable()),
    module_id: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().optional().nullable()),
    object_id: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().optional().nullable()),
    sub_object_id: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().optional().nullable()),
    department_id: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().optional().nullable()),
    assigned_to: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().optional().nullable()),
    // Handling alternative field name from frontend
    assigned_employee_id: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().optional().nullable()),
    due_date: z.string().optional().nullable(),
    task_type: z.enum(['self_assign', 'assign_to_others', 'public']).optional(),
    task_category: z.string().optional().default('customer'),
    attachments: z.array(z.object({
        path: z.string(),
        name: z.string(),
        type: z.string(),
        size: z.number().optional()
    })).optional().default([])
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
                },
                attachments: true
            },
            orderBy: { created_at: 'desc' },
            take: 100
        });

        const safeTasks = tasks.map(task => {
            const taskObj = JSON.parse(JSON.stringify(task, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));
            return {
                ...taskObj,
                priority: taskObj.task_priority,
                status: taskObj.status || '1' // Default to '1' (Created) if field missing
            };
        });

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
        console.log("Incoming Create Task Body:", body);
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

        // Resolve assigned_to from employee_id if provided
        let assignedToUserId: bigint | null = null;
        if (validated.assigned_employee_id || validated.assigned_to) {
            const empId = validated.assigned_employee_id || validated.assigned_to;
            if (empId) {
                // Try to find user associated with this employee
                const user = await prisma.users.findFirst({
                    where: { employee_id: Number(empId) }
                });
                if (user) {
                    assignedToUserId = user.id;
                } else {
                    // Fallback: maybe it IS a user ID (for backward compatibility or direct assignment)
                    assignedToUserId = BigInt(empId);
                }
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
                assigned_to: assignedToUserId, // Use resolved User ID
                due_date: validated.due_date ? new Date(validated.due_date) : null,
                task_type: (validated.task_type as any) || 'assign_to_others',
                task_category: validated.task_category || 'customer',
                task_code: taskCode,
                created_at: new Date(),
                updated_at: new Date(),
                attachments: {
                    create: validated.attachments.map(att => ({
                        file_path: att.path, // Assuming API handles file move/storage elsewhere or just stores path
                        file_name: att.name,
                        file_type: att.type,
                        file_size: att.size
                    }))
                }
            },
        });

        // Create Notification if assigned
        if (assignedToUserId) {
            try {
                const notificationData = {
                    title: 'New Task Assigned',
                    message: `You have been assigned a new task: ${newTask.task_name} (${newTask.task_code})`,
                    link: `/tasks/${newTask.task_id}/details`,
                    type: 'task_assignment',
                    reference_id: newTask.task_id.toString(),
                    reference_type: 'task'
                };

                await prisma.notifications.create({
                    data: {
                        id: crypto.randomUUID(),
                        type: 'task_assignment',
                        notifiable_type: 'User',
                        notifiable_id: assignedToUserId,
                        data: JSON.stringify(notificationData),
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                });
            } catch (notifyError) {
                console.error("Failed to create notification:", notifyError);
                // Don't fail the request if notification fails
            }
        }

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
            console.error("Task Creation Validation Errors:", error.flatten().fieldErrors);
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create task', error: error.message },
            { status: 500 }
        );
    }
}
