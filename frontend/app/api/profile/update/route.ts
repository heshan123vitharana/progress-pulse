import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { avatar } = data;

        if (!avatar) {
            return NextResponse.json({ success: false, message: 'Avatar URL is required' }, { status: 400 });
        }

        // Update user profile
        const updatedUser = await prisma.users.update({
            where: { email: session.user.email },
            data: { avatar },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: updatedUser.id.toString(),
                email: updatedUser.email,
                name: updatedUser.name,
                avatar: updatedUser.avatar
            }
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 });
    }
}
