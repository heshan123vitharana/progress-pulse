import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const roleSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validated = roleSchema.parse(body); // Basic validation
        const permissions = (body as any).permissions || [];

        // Transaction to update role and replace permissions
        const updatedRole = await prisma.$transaction(async (tx) => {
            // 1. Update Role fields
            const role = await tx.roles.update({
                where: { id: BigInt(id) },
                data: {
                    name: validated.name,
                    description: validated.description,
                    slug: validated.name.toLowerCase().replace(/ /g, '-'),
                    status: validated.status || 'active',
                    updated_at: new Date()
                }
            });

            // 2. Delete existing permissions
            await tx.roles_permissions.deleteMany({
                where: { role_id: BigInt(id) }
            });

            // 3. Add new permissions
            if (permissions.length > 0) {
                await tx.roles_permissions.createMany({
                    data: permissions.map((pId: string) => ({
                        role_id: BigInt(id),
                        permission_id: BigInt(pId)
                    }))
                });
            }

            return role;
        });

        const safeRole = JSON.parse(JSON.stringify(updatedRole, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, message: 'Role updated', data: safeRole });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to update role', error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.roles.delete({
            where: { id: BigInt(id) }
        });

        return NextResponse.json({ success: true, message: 'Role deleted' });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to delete role', error: error.message },
            { status: 500 }
        );
    }
}
