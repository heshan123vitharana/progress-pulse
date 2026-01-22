import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const taskId = BigInt(p.id);

        const task = await prisma.tasks.findUnique({
            where: { task_id: taskId },
            select: {
                task_id: true,
                time_tracking_active: true,
                total_time_seconds: true,
                last_switch_on: true
            }
        });

        if (!task) {
            return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
        }

        let currentSessionSeconds = 0;
        if (task.time_tracking_active && task.last_switch_on) {
            const now = new Date();
            const lastSwitchOn = new Date(task.last_switch_on);
            currentSessionSeconds = Math.floor((now.getTime() - lastSwitchOn.getTime()) / 1000);
        }

        return NextResponse.json({
            success: true,
            data: {
                time_tracking_active: task.time_tracking_active,
                total_time_seconds: task.total_time_seconds,
                current_session_seconds: currentSessionSeconds
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to fetch time tracking data', error: error.message }, { status: 500 });
    }
}
