import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const moduleSchema = z.object({
    project_id: z.number().int().positive().optional(),
    module_name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['draft', 'active', 'completed', 'archived']).optional().nullable(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        const module = await prisma.modules.findUnique({
            where: { id: id },
            include: {
                project: true,
                objects: {
                    include: {
                        sub_objects: true // using relation name sub_objects
                    }
                },
                // tasks: true // Tasks relation not yet added to schema, commenting out for now
            }
        });

        if (!module) {
            return NextResponse.json({ success: false, message: 'Module not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: module });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to fetch module', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);
        const body = await request.json();
        const validated = moduleSchema.parse(body);

        const existing = await prisma.modules.findUnique({ where: { id: id } });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Module not found' }, { status: 404 });
        }

        if (validated.project_id) {
            const checkProject = await prisma.projects.findUnique({
                where: { project_id: BigInt(validated.project_id) }
            });
            if (!checkProject) {
                return NextResponse.json(
                    { success: false, message: 'Validation failed', errors: { project_id: ['The selected project id is invalid.'] } },
                    { status: 422 }
                );
            }
        }

        const updated = await prisma.modules.update({
            where: { id: id },
            data: {
                project_id: validated.project_id ? BigInt(validated.project_id) : undefined,
                module_name: validated.module_name,
                description: validated.description,
                status: validated.status as any
            },
            include: { project: true, objects: true }
        });

        return NextResponse.json({ success: true, message: 'Module updated successfully', data: updated });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json({ success: false, message: 'Failed to update module', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        const existing = await prisma.modules.findUnique({ where: { id: id } });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Module not found' }, { status: 404 });
        }

        await prisma.modules.delete({ where: { id: id } });
        return NextResponse.json({ success: true, message: 'Module deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to delete module', error: error.message }, { status: 500 });
    }
}
