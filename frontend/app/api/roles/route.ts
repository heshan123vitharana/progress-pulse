import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const roleSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
});

export async function GET(request: Request) {
    try {
        const roles = await prisma.roles.findMany({
            orderBy: { name: 'asc' }
        });

        const formattedRoles = roles.map((r: any) => ({
            id: r.id.toString(),
            name: r.name,
            description: r.description,
            slug: r.slug,
            status: r.status,
            created_at: r.created_at,
            updated_at: r.updated_at
        }));

        return NextResponse.json({ success: true, data: formattedRoles });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch roles', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = roleSchema.parse(body);

        // Check if role name already exists
        const existing = await prisma.roles.findFirst({
            where: { name: validated.name }
        });

        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Role already exists' },
                { status: 422 }
            );
        }

        const newRole = await prisma.roles.create({
            data: {
                name: validated.name,
                description: validated.description,
                slug: validated.name.toLowerCase().replace(/ /g, '-'),
                status: validated.status || 'active',
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        const safeRole = JSON.parse(JSON.stringify(newRole, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(
            { success: true, message: 'Role created successfully', data: safeRole },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create role', error: error.message },
            { status: 500 }
        );
    }
}
