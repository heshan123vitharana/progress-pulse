import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subObjectSchema = z.object({
    object_id: z.number().int().positive(),
    sub_object_name: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    status: z.enum(['draft', 'active', 'completed', 'archived']).optional().nullable(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const objectId = searchParams.get('object_id');

        let whereClause = {};
        if (objectId) {
            whereClause = { object_id: BigInt(objectId) };
        }

        const subObjects = await prisma.sub_objects.findMany({
            where: whereClause,
            include: {
                object: true,
            },
            orderBy: { created_at: 'desc' },
        });

        const safeSubObjects = JSON.parse(JSON.stringify(subObjects, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeSubObjects });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch sub-objects', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = subObjectSchema.parse(body);

        const checkObject = await prisma.objects.findUnique({
            where: { id: BigInt(validated.object_id) }
        });

        if (!checkObject) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: { object_id: ['The selected object id is invalid.'] } },
                { status: 422 }
            );
        }

        const newSubObject = await prisma.sub_objects.create({
            data: {
                object_id: BigInt(validated.object_id),
                sub_object_name: validated.sub_object_name,
                description: validated.description,
                status: validated.status as any,
            },
        });

        const safeSubObject = JSON.parse(JSON.stringify(newSubObject, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(
            { success: true, message: 'Sub-Object created successfully', data: safeSubObject },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create sub-object', error: error.message },
            { status: 500 }
        );
    }
}
