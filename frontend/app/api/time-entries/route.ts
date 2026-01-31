import { requireAuth } from '@/lib/auth-utils';
import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/api-errors';
import { serializeBigInt, parseToBigInt } from '@/lib/bigint-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTimeEntrySchema = z.object({
    task_id: z.number().optional().nullable(),
    project_id: z.number().optional().nullable(),
    description: z.string().optional().or(z.literal('')),
    start_time: z.string().min(1),
    end_time: z.string().optional().nullable().or(z.literal('')),
    is_billable: z.boolean().optional().default(true),
});

export async function GET(request: Request) {
    try {
        const session = await requireAuth();

        // Parse query params for pagination
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const employeeId = searchParams.get('employee_id');

        let targetUserId = BigInt(session.user.id);

        // Employee Filter (Admin Only)
        // Type assertion to access custom property added in session
        const userRole = (session.user as any).role_slug;
        if (employeeId && userRole === 'admin') {
            const user = await prisma.users.findFirst({
                where: { employee_id: parseInt(employeeId) },
                select: { id: true }
            });

            if (user) {
                targetUserId = user.id;
            } else {
                // If filtering by an invalid employee, return empty
                return createSuccessResponse([]);
            }
        }

        const where: any = {
            user_id: targetUserId
        };

        if (startDate) {
            where.start_time = {
                ...where.start_time,
                gte: new Date(startDate)
            };
        }

        if (endDate) {
            // Set end date to end of day if it's just a date string, or strictly use the provided datetime
            const end = new Date(endDate);
            if (endDate.length === 10) { // YYYY-MM-DD
                end.setHours(23, 59, 59, 999);
            }
            where.start_time = {
                ...where.start_time,
                lte: end
            };
        }

        const entries = await prisma.time_entries.findMany({
            where,
            include: {
                task: {
                    select: {
                        task_id: true,
                        task_name: true,
                        task_code: true
                    }
                },
                project: {
                    select: {
                        project_id: true,
                        project_name: true,
                        project_code: true
                    }
                }
            },
            orderBy: {
                start_time: 'desc'
            },
            take: Math.min(limit, 200), // Max 200 items
            skip: offset
        });

        return createSuccessResponse(serializeBigInt(entries));
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const session = await requireAuth();
        const body = await request.json();
        const validated = createTimeEntrySchema.parse(body);

        // Validate and calculate duration
        const start = new Date(validated.start_time);
        if (isNaN(start.getTime())) {
            return createErrorResponse('Invalid start time format', 422);
        }

        let duration = 0;
        let endTime: Date | null = null;

        if (validated.end_time) {
            const end = new Date(validated.end_time);
            if (isNaN(end.getTime())) {
                return createErrorResponse('Invalid end time format', 422);
            }

            if (end.getTime() < start.getTime()) {
                return createErrorResponse('End time cannot be before start time', 422);
            }

            if (end.getTime() > Date.now()) {
                return createErrorResponse('End time cannot be in the future', 422);
            }

            duration = Math.floor((end.getTime() - start.getTime()) / 1000);
            endTime = end;
        }

        // Validate foreign keys exist (Prisma will handle this automatically now)
        const entry = await prisma.time_entries.create({
            data: {
                user_id: BigInt(session.user.id),
                task_id: parseToBigInt(validated.task_id),
                project_id: parseToBigInt(validated.project_id),
                description: validated.description || null,
                start_time: start,
                end_time: endTime,
                duration: duration,
                is_billable: validated.is_billable,
                status: endTime ? 'stopped' : 'running',
                created_at: new Date(),
                updated_at: new Date()
            },
            include: {
                task: {
                    select: {
                        task_id: true,
                        task_name: true,
                        task_code: true
                    }
                },
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
            serializeBigInt(entry),
            'Time entry created successfully',
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
}
