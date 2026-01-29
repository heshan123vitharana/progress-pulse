import { handleApiError, createSuccessResponse } from '@/lib/api-errors';
import { serializeBigInt } from '@/lib/bigint-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const mainProjectSchema = z.object({
    name: z.string().min(1).max(255),
    code: z.string().max(50).optional().or(z.literal('')).nullable(),
    description: z.string().optional().or(z.literal('')).nullable(),
    status: z.enum(['active', 'inactive', 'archived']).optional().default('active'),
});

export async function GET() {
    try {
        const mainProjects = await prisma.main_projects.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { projects: true } // Count of sub-projects
                },
                projects: {
                    include: {
                        customer: {
                            select: {
                                customer_id: true,
                                customer_name: true,
                                company: true,
                                email: true,
                            }
                        }
                    }
                }
            }
        });

        return createSuccessResponse(serializeBigInt(mainProjects));
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = mainProjectSchema.parse(body);

        const newMainProject = await prisma.main_projects.create({
            data: {
                name: validated.name,
                code: validated.code || null,
                description: validated.description || null,
                status: validated.status,
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        return createSuccessResponse(
            serializeBigInt(newMainProject),
            'Main Project created successfully',
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
}
