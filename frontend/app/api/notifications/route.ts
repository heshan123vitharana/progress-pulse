import { requireAuth } from '@/lib/auth-utils';
import { handleApiError, createSuccessResponse } from '@/lib/api-errors';
import { serializeBigInt } from '@/lib/bigint-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await requireAuth();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const unreadOnly = searchParams.get('unread') === 'true';

        const notifications = await prisma.notifications.findMany({
            where: {
                notifiable_id: BigInt(session.user.id),
                ...(unreadOnly && { read_at: null })
            },
            orderBy: {
                created_at: 'desc'
            },
            take: Math.min(limit, 100)
        });

        return createSuccessResponse(serializeBigInt(notifications));
    } catch (error) {
        return handleApiError(error);
    }
}
