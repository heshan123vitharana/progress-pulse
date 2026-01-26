import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTimeEntrySchema = z.object({
    task_id: z.number().optional().nullable(),
    project_id: z.number().optional().nullable(),
    description: z.string().optional(),
    start_time: z.string(),
    end_time: z.string().optional().nullable(),
    is_billable: z.boolean().optional().default(true),
});

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const entries = await prisma.time_entries.findMany({
            where: {
                user_id: BigInt(session.user.id)
            },
            include: {
                task: true,
                project: true
            },
            orderBy: {
                start_time: 'desc'
            },
            take: 100
        });

        const safeEntries = entries.map(entry => JSON.parse(JSON.stringify(entry, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )));

        return NextResponse.json({ success: true, data: safeEntries });
    } catch (error: any) {
        console.error("GET /api/time-entries Error:", error);
        return NextResponse.json({ success: false, message: 'Failed to fetch time entries', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log("Incoming Create Time Entry Body:", body);
        const validated = createTimeEntrySchema.parse(body);

        // Calculate duration if end_time is provided
        let duration = 0;
        if (validated.end_time) {
            const start = new Date(validated.start_time);
            const end = new Date(validated.end_time);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.error("Invalid Date Format:", { start: validated.start_time, end: validated.end_time });
                return NextResponse.json({ success: false, message: 'Invalid date format provided' }, { status: 422 });
            }

            if (end.getTime() < start.getTime()) {
                return NextResponse.json({ success: false, message: 'End time cannot be before start time' }, { status: 422 });
            }

            duration = Math.floor((end.getTime() - start.getTime()) / 1000);
        } else {
            const start = new Date(validated.start_time);
            if (isNaN(start.getTime())) {
                return NextResponse.json({ success: false, message: 'Invalid start date format' }, { status: 422 });
            }
        }

        // Validate Foreign Keys
        if (validated.task_id) {
            const taskExists = await prisma.tasks.findUnique({ where: { task_id: BigInt(validated.task_id) } });
            if (!taskExists) {
                return NextResponse.json({ success: false, message: 'Invalid Task ID: Task not found' }, { status: 400 });
            }
        }

        if (validated.project_id) {
            const projectExists = await prisma.projects.findUnique({ where: { project_id: BigInt(validated.project_id) } });
            if (!projectExists) {
                return NextResponse.json({ success: false, message: 'Invalid Project ID: Project not found' }, { status: 400 });
            }
        }

        const entry = await prisma.time_entries.create({
            data: {
                user_id: BigInt(session.user.id),
                task_id: validated.task_id ? BigInt(validated.task_id) : null,
                project_id: validated.project_id ? BigInt(validated.project_id) : null,
                description: validated.description,
                start_time: new Date(validated.start_time),
                end_time: validated.end_time ? new Date(validated.end_time) : null,
                duration: duration,
                is_billable: validated.is_billable,
                status: 'stopped',
                created_at: new Date(),
                updated_at: new Date()
            },
            include: {
                task: true,
                project: true
            }
        });

        const safeEntry = JSON.parse(JSON.stringify(entry, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeEntry, message: 'Time entry created successfully' }, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            console.error("Zod Validation Error:", error.flatten().fieldErrors);
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        console.error("Time Entry Creation Error:", error);
        return NextResponse.json({ success: false, message: 'Failed to create time entry', error: error.message }, { status: 500 });
    }
}
