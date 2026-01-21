import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        // Count unread notifications (where read_at is null)
        const unreadCount = await prisma.notifications.count({
            where: {
                read_at: null,
                ...(userId ? { notifiable_id: BigInt(userId) } : {})
            }
        });

        return NextResponse.json({
            success: true,
            data: { unreadCount }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch notification count', error: error.message },
            { status: 500 }
        );
    }
}
