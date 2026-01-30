import { handleApiError, createSuccessResponse } from '@/lib/api-errors';
import { serializeBigInt } from '@/lib/bigint-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest } from 'next/server';

const mainProjectSchema = z.object({
    name: z.string().min(1).max(255),
    code: z.string().max(50).optional().or(z.literal('')).nullable(),
    description: z.string().optional().or(z.literal('')).nullable(),
    status: z.string().optional(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = BigInt(idParam);
        const body = await request.json();
        const validated = mainProjectSchema.parse(body);

        const updatedMainProject = await prisma.main_projects.update({
            where: { id },
            data: {
                name: validated.name,
                code: validated.code || null,
                description: validated.description || null,
                status: validated.status || 'active',
                updated_at: new Date()
            }
        });

        return createSuccessResponse(
            serializeBigInt(updatedMainProject),
            'Product Line updated successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = BigInt(idParam);

        // Check if there are associated projects
        const projectCount = await prisma.projects.count({
            where: { main_project_id: id }
        });

        if (projectCount > 0) {
            return createSuccessResponse(
                null,
                `Cannot delete. This product line has ${projectCount} associated deployment(s). Please remove or reassign them first.`,
                400
            );
        }

        await prisma.main_projects.delete({
            where: { id }
        });

        return createSuccessResponse(null, 'Product Line deleted successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
