import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const taskId = BigInt(p.id);

        const task = await prisma.tasks.findUnique({
            where: { task_id: taskId }
        });

        if (!task) {
            return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
        }

        if (!task.time_tracking_active || !task.last_switch_on) {
            return NextResponse.json({ success: false, message: 'Time tracking is not active' }, { status: 400 });
        }

        const now = new Date();
        const lastSwitchOn = new Date(task.last_switch_on);
        const durationSeconds = Math.floor((now.getTime() - lastSwitchOn.getTime()) / 1000);

        // Transaction to update task and close time entry
        await prisma.$transaction(async (tx) => {
            // Update task totals
            await tx.tasks.update({
                where: { task_id: taskId },
                data: {
                    time_tracking_active: false,
                    last_switch_on: null,
                    total_time_seconds: { increment: durationSeconds },
                    updated_at: now
                }
            });

            // Find and close the active time entry for this task
            // We find the most recent 'running' entry for this task
            const activeEntry = await tx.time_entries.findFirst({
                where: {
                    task_id: taskId,
                    status: 'running',
                    end_time: null
                },
                orderBy: { created_at: 'desc' }
            });

            if (activeEntry) {
                await tx.time_entries.update({
                    where: { id: activeEntry.id },
                    data: {
                        end_time: now,
                        duration: durationSeconds,
                        status: 'stopped',
                        updated_at: now
                    }
                });
            }
        });

        return NextResponse.json({ success: true, message: 'Time tracking stopped', data: { duration_added: durationSeconds } });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to stop tracking', error: error.message }, { status: 500 });
    }
}
