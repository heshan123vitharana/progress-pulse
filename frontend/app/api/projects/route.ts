import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/api-errors';
import { serializeBigInt, parseToBigInt } from '@/lib/bigint-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const projectSchema = z.object({
    project_name: z.string().min(1).max(255),
    project_code: z.string().max(50).optional().or(z.literal('')).nullable(),
    description: z.string().optional().or(z.literal('')).nullable(),
    client_id: z.number().optional().nullable(),
    start_date: z.string().optional().or(z.literal('')).nullable(),
    end_date: z.string().optional().or(z.literal('')).nullable(),
    status: z.enum(['planned', 'active', 'in_progress', 'completed', 'on_hold', 'cancelled']).optional().nullable(),
    supervised_by_id: z.number().optional().nullable(),
    developers: z.array(z.number()).optional().nullable(),
    support_team: z.array(z.number()).optional().nullable(),
    main_project_id: z.number().optional().nullable(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customer_id');

        const projects = await prisma.projects.findMany({
            where: customerId ? { customer_id: BigInt(customerId) } : undefined,
            orderBy: { project_name: 'asc' },
            include: {
                customer: {
                    select: {
                        customer_id: true,
                        customer_name: true,
                        email: true
                    }
                },
                main_project: true
            }
        });

        return createSuccessResponse(serializeBigInt(projects));
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = projectSchema.parse(body);

        // Auto-generate project code if not provided
        let finalProjectCode = validated.project_code || null;
        if (!finalProjectCode) {
            const lastProject = await prisma.projects.findFirst({
                orderBy: { created_at: 'desc' },
                select: { project_code: true }
            });

            let nextNum = 1;
            if (lastProject?.project_code) {
                const match = lastProject.project_code.match(/PROJ-(\d+)/);
                if (match) {
                    nextNum = parseInt(match[1]) + 1;
                }
            }
            finalProjectCode = `PROJ-${nextNum.toString().padStart(3, '0')}`;
        }

        const newProject = await prisma.projects.create({
            data: {
                project_name: validated.project_name,
                project_code: finalProjectCode,
                customer_id: parseToBigInt(validated.client_id),
                start_date: validated.start_date ? new Date(validated.start_date) : null,
                end_date: validated.end_date ? new Date(validated.end_date) : null,
                status: (validated.status as any) || 'planned',
                supervised_by_id: parseToBigInt(validated.supervised_by_id),
                main_project_id: parseToBigInt(validated.main_project_id),
                created_at: new Date(),
                updated_at: new Date()
            },
            include: {
                customer: {
                    select: {
                        customer_id: true,
                        customer_name: true,
                        email: true
                    }
                },
                main_project: true
            }
        });

        return createSuccessResponse(
            serializeBigInt(newProject),
            'Project created successfully',
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
}
