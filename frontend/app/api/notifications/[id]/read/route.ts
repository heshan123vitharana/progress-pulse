import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // params is now a Promise in Next.js 15+ or structured this way for consistency
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const notificationId = Number(id);

        if (isNaN(notificationId)) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
        }

        // Verify ownership
        const notification = await prisma.notifications.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 });
        }

        if (Number(notification.notifiable_id) !== Number(session.user.id)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const updated = await prisma.notifications.update({
            where: { id: notificationId },
            data: { read_at: new Date() }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...updated,
                id: Number(updated.id),
                notifiable_id: updated.notifiable_id.toString()
            }
        });
    } catch (error: any) {
        console.error('Error marking notification read:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update notification', error: error.message },
            { status: 500 }
        );
    }
}
