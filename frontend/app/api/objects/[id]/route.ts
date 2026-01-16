import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const objectSchema = z.object({
    module_id: z.number().int().positive().optional(),
    object_name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['draft', 'active', 'completed', 'archived']).optional().nullable(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        const object = await prisma.objects.findUnique({
            where: { id: id },
            include: {
                module: true,
                sub_objects: true,
                // tasks: true 
            }
        });

        if (!object) {
            return NextResponse.json({ success: false, message: 'Object not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: object });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to fetch object', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);
        const body = await request.json();
        const validated = objectSchema.parse(body);

        const existing = await prisma.objects.findUnique({ where: { id: id } });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Object not found' }, { status: 404 });
        }

        if (validated.module_id) {
            const checkModule = await prisma.modules.findUnique({
                where: { id: BigInt(validated.module_id) }
            });
            if (!checkModule) {
                return NextResponse.json(
                    { success: false, message: 'Validation failed', errors: { module_id: ['The selected module id is invalid.'] } },
                    { status: 422 }
                );
            }
        }

        const updated = await prisma.objects.update({
            where: { id: id },
            data: {
                module_id: validated.module_id ? BigInt(validated.module_id) : undefined,
                object_name: validated.object_name,
                description: validated.description,
                status: validated.status as any
            },
            include: { module: true, sub_objects: true }
        });

        return NextResponse.json({ success: true, message: 'Object updated successfully', data: updated });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json({ success: false, message: 'Failed to update object', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        const existing = await prisma.objects.findUnique({ where: { id: id } });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Object not found' }, { status: 404 });
        }

        await prisma.objects.delete({ where: { id: id } });
        return NextResponse.json({ success: true, message: 'Object deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to delete object', error: error.message }, { status: 500 });
    }
}
