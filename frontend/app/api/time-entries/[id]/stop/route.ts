import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        if (entry.status !== 'running') {
            return NextResponse.json({ success: false, message: 'Timer is not running' }, { status: 400 });
        }

        const endTime = new Date();
        const startTime = new Date(entry.start_time);
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        const updated = await prisma.time_entries.update({
            where: { id: entryId },
            data: {
                end_time: endTime,
                duration: duration,
                status: 'stopped',
                updated_at: endTime
            },
            include: {
                task: true,
                project: true
            }
        });

        const safeEntry = JSON.parse(JSON.stringify(updated, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeEntry, message: 'Timer stopped' });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to stop timer', error: error.message }, { status: 500 });
    }
}
