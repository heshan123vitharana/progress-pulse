import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-utils';
import { serializeBigInt } from '@/lib/bigint-utils';

const taskSchema = z.object({
    task_name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    task_priority: z.number().int().optional(),
    assigned_to: z.preprocess(
        (val) => (val === "" || val === undefined ? undefined : Number(val)),
        z.number().optional().nullable()
    ),
    assigned_employee_id: z.preprocess(
        (val) => (val === "" || val === undefined ? undefined : Number(val)),
        z.number().optional().nullable()
    ),
    status: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        let session;
        try {
            session = await requireAuth();
        } catch (e) {
            // Allow public access mostly, but assignments need auth
        }

        const task = await prisma.tasks.findUnique({
            where: { task_id: id },
            include: {
                project: true,
                module: true,
                object: true,
                department: true,
                assigned_user: { select: { id: true, name: true } },
                assignments: {
                    include: {
                        assigned_employee: true
                    },
                    orderBy: { created_at: 'desc' },
                    take: 1
                }
            }
        });

        if (!task) {
            return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
        }

        const safeTask = JSON.parse(JSON.stringify(task, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        // Fallback for assigned_user & Populate employee object
        if (safeTask.assignments && safeTask.assignments.length > 0) {
            const latestAssignment = safeTask.assignments[0];
            if (latestAssignment.assigned_employee) {
                // Populate employee field for frontend
                safeTask.employee = latestAssignment.assigned_employee;

                // Fallback for assigned_user if null
                if (!safeTask.assigned_user) {
                    safeTask.assigned_user = {
                        id: 0,
                        name: `${latestAssignment.assigned_employee.first_name} ${latestAssignment.assigned_employee.last_name}`,
                        email: latestAssignment.assigned_employee.email || '',
                    };
                }
            }
        }

        // Check for current user's assignment if logged in
        if (session?.user?.id) {
            const userId = parseInt(session.user.id);
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });

            if (user?.employee_id) {
                const employeeId = BigInt(user.employee_id);
                const userAssignment = await prisma.taskassignments.findFirst({
                    where: {
                        task_id: id,
                        assigned_employee_id: employeeId
                    }
                });
                if (userAssignment) {
                    // @ts-ignore
                    safeTask.currentUserAssignment = JSON.parse(JSON.stringify(userAssignment, (key, value) =>
                        typeof value === 'bigint' ? value.toString() : value
                    ));
                }
            }
        }

        return NextResponse.json({ success: true, data: safeTask });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to fetch task', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);
        console.log(`[PUT Task ${id}] Starting update...`);

        let body;
        try {
            body = await request.json();
            console.log(`[PUT Task ${id}] Body:`, body);
        } catch (e) {
            console.error(`[PUT Task ${id}] Failed to parse JSON body`, e);
            throw new Error('Invalid JSON body');
        }

        const validated = taskSchema.parse(body);
        console.log(`[PUT Task ${id}] Validated data:`, validated);

        const existing = await prisma.tasks.findUnique({ where: { task_id: id } });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
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
                    // Fallback: maybe it IS a user ID
                    assignedToUserId = BigInt(empId);
                }
            }
        }

        console.log(`[PUT Task ${id}] Update execution...`);
        const updated = await prisma.tasks.update({
            where: { task_id: id },
            data: {
                task_name: validated.task_name,
                description: validated.description,
                task_priority: validated.task_priority,
                status: validated.status,
                assigned_to: assignedToUserId !== null ? assignedToUserId : undefined,
                updated_at: new Date()
            }
        });
        console.log(`[PUT Task ${id}] Prisma update success.`);

        // Send Notification if assigned_to changed (and is not null)
        if (assignedToUserId && existing.assigned_to !== assignedToUserId) {
            let employeeIdForAssignment = validated.assigned_employee_id || validated.assigned_to;

            // Create TaskAssignment entry
            if (employeeIdForAssignment) {
                await prisma.taskassignments.create({
                    data: {
                        task_id: updated.task_id,
                        assigned_employee_id: BigInt(employeeIdForAssignment),
                        status: 1, // Assigned
                        completed_datetime: new Date(0), // Placeholder for mandatory field
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                });
            }

            try {
                const notificationData = {
                    title: 'Task Assigned',
                    message: `You have been assigned to task: ${updated.task_name}`,
                    link: `/tasks/${updated.task_id}/details`,
                    type: 'task_assignment',
                    reference_id: updated.task_id.toString(),
                    reference_type: 'task'
                };

                await prisma.notifications.create({
                    data: {
                        id: crypto.randomUUID(),
                        type: 'task_assignment',
                        notifiable_type: 'User',
                        notifiable_id: assignedToUserId, // This MUST be a User ID
                        data: JSON.stringify(notificationData),
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                });
            } catch (notifyError) {
                console.error("Failed to create notification:", notifyError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Task updated successfully',
            data: serializeBigInt(updated)
        });

    } catch (error: any) {
        console.error('Task update error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                message: `Validation failed: ${JSON.stringify(error.flatten().fieldErrors)}`,
                errors: error.flatten().fieldErrors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: `Failed to update task: ${error.message}`,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        await prisma.tasks.delete({ where: { task_id: id } });
        return NextResponse.json({ success: true, message: 'Task deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to delete task', error: error.message }, { status: 500 });
    }
}
