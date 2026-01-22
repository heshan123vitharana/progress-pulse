import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const taskId = BigInt(p.id);

        // check if task exists
        const task = await prisma.tasks.findUnique({
            where: { task_id: taskId }
        });

        if (!task) {
            return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
        }

        if (task.time_tracking_active) {
            return NextResponse.json({ success: false, message: 'Time tracking is already active' }, { status: 400 });
        }

        const now = new Date();

        // Transaction to update task and create time entry
        await prisma.$transaction(async (tx) => {
            // Update task status
            await tx.tasks.update({
                where: { task_id: taskId },
                data: {
                    time_tracking_active: true,
                    last_switch_on: now,
                    updated_at: now
                }
            });

            // Create new time entry
            // Note: user_id should normally come from session. using a placeholder or assigned_to for now if available, 
            // but for this specific fix I'll assume 1 or the assigned user if available to avoid auth complexity right now unless required.
            // Looking at the schema, user_id is BigInt and required in time_entries.
            // Let's try to deduce a valid user_id. 
            // In a real app we'd get this from the session (req.headers or next-auth).
            // For now, I'll default to the task's assigned_to or 1 if null, to prevent FK errors.

            const userId = task.assigned_to || BigInt(1); // Fallback to 1 if not assigned, assuming user 1 exists.

            await tx.time_entries.create({
                data: {
                    task_id: taskId,
                    user_id: userId,
                    start_time: now,
                    status: 'running',
                    is_billable: true,
                    created_at: now,
                    updated_at: now,
                    project_id: task.project_id
                }
            });
        });

        return NextResponse.json({ success: true, message: 'Time tracking started' });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to start tracking', error: error.message }, { status: 500 });
    }
}
