import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const updated = await prisma.notifications.updateMany({
            where: {
                notifiable_id: BigInt(session.user.id),
                read_at: null
            },
            data: {
                read_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'All notifications marked as read',
            data: { count: updated.count }
        });
    } catch (error: any) {
        console.error('Error marking all read:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to mark notifications read', error: error.message },
            { status: 500 }
        );
    }
}
