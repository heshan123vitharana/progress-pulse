import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const taskSchema = z.object({
    task_name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    task_priority: z.number().int().optional(),
    // Add other fields as optional for update
});

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
                assigned_user: { select: { id: true, name: true } }
            }
        });

        if (!task) {
            return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
        }

        const safeTask = JSON.parse(JSON.stringify(task, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeTask });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to fetch task', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);
        const body = await request.json();
        const validated = taskSchema.parse(body);

        const existing = await prisma.tasks.findUnique({ where: { task_id: id } });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
        }

        const updated = await prisma.tasks.update({
            where: { task_id: id },
            data: {
                task_name: validated.task_name,
                description: validated.description,
                task_priority: validated.task_priority,
                updated_at: new Date()
            }
        });

        const safeUpdated = JSON.parse(JSON.stringify(updated, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, message: 'Task updated successfully', data: safeUpdated });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to update task', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        await prisma.tasks.delete({ where: { task_id: id } });
        return NextResponse.json({ success: true, message: 'Task deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to delete task', error: error.message }, { status: 500 });
    }
}
