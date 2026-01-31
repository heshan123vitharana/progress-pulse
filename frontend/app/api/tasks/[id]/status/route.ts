import { requireAuth } from '@/lib/auth-utils';
import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/api-errors';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateStatusSchema = z.object({
    // 'picked_up' is for assignment acceptance
    // '3' = QA, '7' = Test Server, '5' = Completed
    status: z.enum(['picked_up', '3', '7', '5']),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAuth();
        const body = await request.json();
        console.log(`[POST Status] Body:`, body);

        const validated = updateStatusSchema.parse(body);
        const p = await params;
        const taskId = BigInt(p.id);
        const userId = parseInt(session.user.id);

        console.log(`[POST Status] User: ${userId}, Task: ${taskId}, Status: ${validated.status}`);

        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user?.employee_id) {
            console.error(`[POST Status] User ${userId} has no employee_id`);
            return createErrorResponse('User is not linked to an employee record', 400);
        }

        const employeeId = BigInt(user.employee_id);

        // Find the pending assignment
        const assignment = await prisma.taskassignments.findFirst({
            where: {
                task_id: taskId,
                assigned_employee_id: employeeId
            }
        });

        if (!assignment) {
            return createErrorResponse('You are not assigned to this task', 403);
        }

        if (validated.status === 'picked_up') {
            await prisma.taskassignments.update({
                where: { assignment_id: assignment.assignment_id },
                data: {
                    acceptance_status: 'accepted',
                    accepted_by: BigInt(userId),
                    accepted_datetime: new Date(),
                    updated_at: new Date()
                }
            });

            // Also update the main task status to show it's been accepted
            await prisma.tasks.update({
                where: { task_id: taskId },
                data: {
                    is_accepted: true,
                    accepted_by: BigInt(userId),
                    accepted_at: new Date(),
                    updated_at: new Date()
                }
            });
        } else {
            // Handle standard status updates (QA, Test, Complete)
            console.log(`[POST Status] Updating task ${taskId} to status ${validated.status} (type: ${typeof validated.status})`);
            try {
                await prisma.tasks.update({
                    where: { task_id: taskId },
                    data: {
                        status: validated.status,
                        updated_at: new Date(),
                    }
                });
            } catch (innerError: any) {
                console.error('[POST Status] Prisma Update Failed:', innerError);
                return createErrorResponse(
                    `Prisma Validation Error: ${innerError.message}`,
                    400
                );
            }
        }

        return createSuccessResponse({ success: true, message: 'Task status updated' });

    } catch (error) {
        return handleApiError(error);
    }
}
