import { requireAuth } from '@/lib/auth-utils';
import { handleApiError, createSuccessResponse } from '@/lib/api-errors';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await requireAuth();

        // Count unread notifications (where read_at is null) for the logged-in user
        const unreadCount = await prisma.notifications.count({
            where: {
                notifiable_id: BigInt(session.user.id),
                read_at: null,
            }
        });

        return createSuccessResponse({ unreadCount });
    } catch (error) {
        return handleApiError(error);
    }
}

