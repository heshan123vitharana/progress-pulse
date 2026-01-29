import { requireAuth } from '@/lib/auth-utils';
import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/api-errors';
import { serializeBigInt } from '@/lib/bigint-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await requireAuth();

        const activeTimer = await prisma.time_entries.findFirst({
            where: {
                user_id: BigInt(session.user.id),
                status: 'running'
            },
            include: {
                task: {
                    select: {
                        task_id: true,
                        task_name: true,
                        task_code: true
                    }
                },
                project: {
                    select: {
                        project_id: true,
                        project_name: true,
                        project_code: true
                    }
                }
            },
            orderBy: {
                start_time: 'desc'
            }
        });

        return createSuccessResponse(activeTimer ? serializeBigInt(activeTimer) : null);
    } catch (error) {
        return handleApiError(error);
    }
}
