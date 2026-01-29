import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        const task = await prisma.tasks.findUnique({
            where: { task_id: id },
            include: {
                project: true,
                module: true,
                object: true,
                department: true,
                assigned_user: true,
                assignments: {
                    include: {
                        assigned_employee: true
                    }
                }
            }
        });

        const safeTask = JSON.parse(JSON.stringify(task, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeTask });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
