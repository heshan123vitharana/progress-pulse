import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const objectSchema = z.object({
    module_id: z.number().int().positive(),
    object_name: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    status: z.enum(['draft', 'active', 'completed', 'archived']).optional().nullable(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const moduleId = searchParams.get('module_id');

        let whereClause = {};
        if (moduleId) {
            whereClause = { module_id: BigInt(moduleId) };
        }

        const objects = await prisma.objects.findMany({
            where: whereClause,
            include: {
                module: true,
                sub_objects: true,
            },
            orderBy: { created_at: 'desc' },
        });

        const safeObjects = JSON.parse(JSON.stringify(objects, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeObjects });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch objects', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = objectSchema.parse(body);

        const checkModule = await prisma.modules.findUnique({
            where: { id: BigInt(validated.module_id) }
        });

        if (!checkModule) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: { module_id: ['The selected module id is invalid.'] } },
                { status: 422 }
            );
        }

        const newObject = await prisma.objects.create({
            data: {
                module_id: BigInt(validated.module_id),
                object_name: validated.object_name,
                description: validated.description,
                status: validated.status as any,
            },
        });

        const ObjectWithRelations = await prisma.objects.findUnique({
            where: { id: newObject.id },
            include: { module: true, sub_objects: true }
        });

        const safeObject = JSON.parse(JSON.stringify(ObjectWithRelations, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(
            { success: true, message: 'Object created successfully', data: safeObject },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create object', error: error.message },
            { status: 500 }
        );
    }
}
