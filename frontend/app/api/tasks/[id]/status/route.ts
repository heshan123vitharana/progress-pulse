import { requireAuth } from '@/lib/auth-utils';
import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/api-errors';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateStatusSchema = z.object({
    status: z.enum(['picked_up']),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAuth();
        const body = await request.json();
        const validated = updateStatusSchema.parse(body);
        const p = await params;
        const taskId = BigInt(p.id);
        const userId = parseInt(session.user.id);

        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user?.employee_id) {
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
        }

        return createSuccessResponse({ success: true, message: 'Task status updated' });

    } catch (error) {
        return handleApiError(error);
    }
}
