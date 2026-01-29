import { handleApiError, createSuccessResponse } from '@/lib/api-errors';
import { serializeBigInt, parseToBigInt } from '@/lib/bigint-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const moduleSchema = z.object({
    project_id: z.number().int().positive(),
    module_name: z.string().min(1).max(255),
    description: z.string().optional().or(z.literal('')).nullable(),
    status: z.enum(['draft', 'active', 'completed', 'archived']).optional().nullable(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project_id');

        let whereClause = {};
        if (projectId) {
            try {
                whereClause = { project_id: BigInt(projectId) };
            } catch (e) {
                console.error('Invalid project_id:', projectId);
                return createSuccessResponse(serializeBigInt([])); // Return empty if invalid ID
            }
        }

        const modules = await prisma.modules.findMany({
            where: whereClause,
            include: {
                project: {
                    select: {
                        project_id: true,
                        project_name: true,
                        project_code: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
        });

        return createSuccessResponse(serializeBigInt(modules));
    } catch (error) {
        console.error('Modules API Error:', error);
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = moduleSchema.parse(body);

        // Verify project exists
        const project = await prisma.projects.findUnique({
            where: { project_id: BigInt(validated.project_id) }
        });

        if (!project) {
            return createSuccessResponse(null, 'Project not found', 404);
        }

        const newModule = await prisma.modules.create({
            data: {
                project_id: BigInt(validated.project_id),
                module_name: validated.module_name,
                description: validated.description || null,
                status: (validated.status as any) || 'active',
                created_at: new Date(),
                updated_at: new Date()
            },
            include: {
                project: {
                    select: {
                        project_id: true,
                        project_name: true,
                        project_code: true
                    }
                }
            }
        });

        return createSuccessResponse(
            serializeBigInt(newModule),
            'Module created successfully',
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
}
