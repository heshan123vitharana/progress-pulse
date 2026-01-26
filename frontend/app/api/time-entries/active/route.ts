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

        const activeTimer = await prisma.time_entries.findFirst({
            where: {
                user_id: BigInt(session.user.id),
                status: 'running'
            },
            include: {
                task: true,
                project: true
            }
        });

        if (!activeTimer) {
            return NextResponse.json({ success: true, data: null });
        }

        const safeEntry = JSON.parse(JSON.stringify(activeTimer, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeEntry });
    } catch (error: any) {
        console.error("GET /api/time-entries/active Error:", error);
        return NextResponse.json({ success: false, message: 'Failed to fetch active timer', error: error.message }, { status: 500 });
    }
}
