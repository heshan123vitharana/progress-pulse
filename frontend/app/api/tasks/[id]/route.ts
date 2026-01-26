import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const taskSchema = z.object({
    task_name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    task_priority: z.number().int().optional(),
    assigned_to: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().optional().nullable()),
    assigned_employee_id: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().optional().nullable()),
    status: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        const task = await prisma.tasks.findUnique({
            where: { task_id: id },
            include: {
                project: true,
                module: true,
                object: true,
                department: true,
                assigned_user: { select: { id: true, name: true } }
            }
        });

        if (!task) {
            return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
        }

        const safeTask = JSON.parse(JSON.stringify(task, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeTask });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to fetch task', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);
        const body = await request.json();
        const validated = taskSchema.parse(body);

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

        const updated = await prisma.tasks.update({
            where: { task_id: id },
            data: {
                task_name: validated.task_name,
                description: validated.description,
                task_priority: validated.task_priority,
                assigned_to: assignedToUserId !== null ? assignedToUserId : undefined, // Only update if resolved
                updated_at: new Date()
            }
        });

        // Send Notification if assigned_to changed (and is not null)
        if (assignedToUserId && existing.assigned_to !== assignedToUserId) {
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
                        notifiable_id: assignedToUserId,
                        data: JSON.stringify(notificationData),
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                });
            } catch (notifyError) {
                console.error("Failed to create notification:", notifyError);
            }
        }

        const safeUpdated = JSON.parse(JSON.stringify(updated, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, message: 'Task updated successfully', data: safeUpdated });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to update task', error: error.message }, { status: 500 });
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
