import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const designationSchema = z.object({
    designation_name: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params; // Wait for params in Next.js 15+
        const id = BigInt(p.id);
        const designation = await prisma.designations.findUnique({
            where: { designation_id: id }
        });

        if (!designation) {
            return NextResponse.json({ success: false, message: 'Designation not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: designation });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to fetch designation', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);
        const body = await request.json();
        const validated = designationSchema.parse(body);

        // Check if exists
        const existing = await prisma.designations.findUnique({ where: { designation_id: id } });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Designation not found' }, { status: 404 });
        }

        // Check uniqueness excluding current (Laravel: unique:designations,designation,id)
        const duplicate = await prisma.designations.findFirst({
            where: {
                designation: validated.designation_name,
                NOT: { designation_id: id }
            }
        });

        if (duplicate) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: { designation_name: ['The designation name has already been taken.'] } },
                { status: 422 }
            );
        }

        const updated = await prisma.designations.update({
            where: { designation_id: id },
            data: {
                designation: validated.designation_name,
                description: validated.description,
                status: validated.status as any
            }
        });

        return NextResponse.json({ success: true, message: 'Designation updated successfully', data: updated });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json({ success: false, message: 'Failed to update designation', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const p = await params;
        const id = BigInt(p.id);

        // Check if exists
        const existing = await prisma.designations.findUnique({ where: { designation_id: id } });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Designation not found' }, { status: 404 });
        }

        await prisma.designations.delete({ where: { designation_id: id } });
        return NextResponse.json({ success: true, message: 'Designation deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Failed to delete designation', error: error.message }, { status: 500 });
    }
}
