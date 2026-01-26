import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const p = await params;
        const entryId = BigInt(p.id);

        const entry = await prisma.time_entries.findUnique({
            where: { id: entryId }
        });

        if (!entry) {
            return NextResponse.json({ success: false, message: 'Time entry not found' }, { status: 404 });
        }

        if (entry.user_id !== BigInt(session.user.id)) {
            // Optionally allow admins to delete
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        await prisma.time_entries.delete({
            where: { id: entryId }
        });

        return NextResponse.json({ success: true, message: 'Time entry deleted' });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to delete time entry', error: error.message }, { status: 500 });
    }
}
