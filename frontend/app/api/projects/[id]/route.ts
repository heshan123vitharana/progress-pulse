import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const projectSchema = z.object({
    project_name: z.string().min(1).max(255).optional(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    status: z.enum(['planned', 'in_progress', 'completed', 'on_hold', 'cancelled']).optional().nullable(),
    customer_id: z.number().optional().nullable(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        const project = await prisma.projects.findUnique({
            where: { project_id: id },
            include: { customer: true }
        });

        if (!project) {
            return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
        }

        // Get task count
        const taskCount = await prisma.tasks.count({
            where: { project_id: id }
        });

        const projectWithCount = {
            ...project,
            task_count: taskCount
        };

        const safeProject = JSON.parse(JSON.stringify(projectWithCount, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeProject });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to fetch project', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);
        const body = await request.json();
        const validated = projectSchema.parse(body);

        const existing = await prisma.projects.findUnique({ where: { project_id: id } });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
        }

        const updated = await prisma.projects.update({
            where: { project_id: id },
            data: {
                project_name: validated.project_name,
                customer_id: validated.customer_id ? BigInt(validated.customer_id) : undefined,
                start_date: validated.start_date ? new Date(validated.start_date) : undefined,
                end_date: validated.end_date ? new Date(validated.end_date) : undefined,
                status: validated.status as any,
                updated_at: new Date()
            }
        });

        const safeUpdated = JSON.parse(JSON.stringify(updated, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, message: 'Project updated successfully', data: safeUpdated });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to update project', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        // Check for tasks
        const taskCount = await prisma.tasks.count({ where: { project_id: id } });
        if (taskCount > 0) {
            return NextResponse.json({
                success: false,
                message: `Cannot delete project. It has ${taskCount} task(s) assigned.`
            }, { status: 400 });
        }

        await prisma.projects.delete({ where: { project_id: id } });
        return NextResponse.json({ success: true, message: 'Project deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to delete project', error: error.message }, { status: 500 });
    }
}
