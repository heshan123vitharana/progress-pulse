import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const taskId = parseInt(params.id);
        if (isNaN(taskId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid task ID' },
                { status: 400 }
            );
        }

        // Get the task to find the creator
        const task = await prisma.task.findUnique({
            where: { task_id: taskId },
            include: {
                employee: true,
                created_by_user: true
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
        if (task.employee_id !== currentEmployeeId) {
            return NextResponse.json(
                { success: false, message: 'You are not assigned to this task' },
                { status: 403 }
            );
        }

        // Update task assignment status or handle rejection logic
        // For now, we'll just keep the task as-is but create a notification

        // Create notification for the task creator
        if (task.created_by) {
            const rejectorName = session.user.name || 'User';

            await prisma.notification.create({
                data: {
                    user_id: task.created_by,
                    type: 'task_rejected',
                    data: JSON.stringify({
                        title: 'Task Assignment Declined',
                        message: `${rejectorName} declined the task "${task.task_name}"`,
                        task_id: task.task_id,
                        task_name: task.task_name,
                        task_code: task.task_code,
                        rejected_by: rejectorName,
                        link: `/tasks/${task.task_id}/details`
                    })
                }
            });
        }

        // Log activity
        await prisma.activityLog.create({
            data: {
                user_id: session.user.id,
                action: 'reject_task',
                entity_type: 'task',
                entity_id: taskId,
                details: `Rejected task assignment: ${task.task_name}`
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
    } finally {
        await prisma.$disconnect();
    }
}
