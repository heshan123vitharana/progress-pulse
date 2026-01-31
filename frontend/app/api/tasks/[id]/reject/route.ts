import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const taskId = parseInt(resolvedParams.id);
        if (isNaN(taskId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid task ID' },
                { status: 400 }
            );
        }

        // Get the task to find the creator
        const task = await prisma.tasks.findUnique({
            where: { task_id: BigInt(taskId) },
            include: {
                employee: true
            }
        });

        if (!task) {
            return NextResponse.json(
                { success: false, message: 'Task not found' },
                { status: 404 }
            );
        }

        // Verify the current user is the assigned employee
        const currentEmployeeId = session.user.employee_id;
        if (task.employee_id && Number(task.employee_id) !== Number(currentEmployeeId)) {
            return NextResponse.json(
                { success: false, message: 'You are not assigned to this task' },
                { status: 403 }
            );
        }

        // Create notification for the task creator
        if (task.created_by) {
            const rejectorName = session.user.name || 'User';

            // Get the creator user ID from the users table based on employee_id
            const creatorUser = await prisma.users.findFirst({
                where: { employee_id: Number(task.created_by) }
            });

            if (creatorUser) {
                // Create notification in the notifications table format (uses UUID)
                const notificationId = crypto.randomUUID();
                await prisma.notifications.create({
                    data: {
                        id: notificationId,
                        type: 'task_rejected',
                        notifiable_type: 'App\\Models\\User',
                        notifiable_id: BigInt(creatorUser.id),
                        data: JSON.stringify({
                            title: 'Task Assignment Declined',
                            message: `${rejectorName} declined the task "${task.task_name}"`,
                            task_id: taskId,
                            task_name: task.task_name,
                            task_code: task.task_code,
                            rejected_by: rejectorName,
                            link: `/tasks/${taskId}/details`
                        })
                    }
                });
            }
        }

        // Log activity
        await prisma.activity_log.create({
            data: {
                user_id: parseInt(session.user.id),
                action: 'reject_task',
                name: 'System',
                module: 'Tasks',
                description: `Rejected task assignment: ${task.task_name}`,
                created_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Task assignment declined successfully',
            data: { task_id: taskId }
        });

    } catch (error: any) {
        console.error('Error rejecting task:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to reject task',
                error: error.message
            },
            { status: 500 }
        );
    }
}
