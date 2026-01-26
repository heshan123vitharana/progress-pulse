import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const startTimerSchema = z.object({
    task_id: z.number().optional().nullable(),
    project_id: z.number().optional().nullable(),
    description: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const userId = BigInt(session.user.id);

        // Check if there is already a running timer for this user
        const existingTimer = await prisma.time_entries.findFirst({
            where: {
                user_id: userId,
                status: 'running'
            }
        });

        if (existingTimer) {
            return NextResponse.json({ success: false, message: 'You already have a running timer. Please stop it first.' }, { status: 400 });
        }

        const body = await request.json();
        const validated = startTimerSchema.parse(body);

        const entry = await prisma.time_entries.create({
            data: {
                user_id: userId,
                task_id: validated.task_id ? BigInt(validated.task_id) : null,
                project_id: validated.project_id ? BigInt(validated.project_id) : null,
                description: validated.description,
                start_time: new Date(),
                status: 'running',
                is_billable: true, // Default
                created_at: new Date(),
                updated_at: new Date()
            },
            include: {
                task: true,
                project: true
            }
        });

        // If task_id is present, optionally update task status or log activity here (skipping for now to stick to core requirement)

        const safeEntry = JSON.parse(JSON.stringify(entry, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeEntry, message: 'Timer started' }, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json({ success: false, message: 'Failed to start timer', error: error.message }, { status: 500 });
    }
}
