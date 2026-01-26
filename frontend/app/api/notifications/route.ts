import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await prisma.notifications.findMany({
            where: {
                notifiable_id: BigInt(session.user.id)
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Convert BigInt to string only for serialization
        const serializedNotifications = notifications.map(notification => ({
            ...notification,
            id: notification.id,
            notifiable_id: notification.notifiable_id.toString(),
            data: notification.data
        }));

        return NextResponse.json({
            success: true,
            data: serializedNotifications
        });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch notifications', error: error.message },
            { status: 500 }
        );
    }
}
