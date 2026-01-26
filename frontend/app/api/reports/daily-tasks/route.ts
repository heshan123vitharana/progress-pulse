import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start_date = searchParams.get('start_date');
        const end_date = searchParams.get('end_date');
        const employee_id = searchParams.get('employee_id');
        const project_id = searchParams.get('project_id');
        const status = searchParams.get('status');

        const whereClause: any = {};

        // Date filter
        if (start_date && end_date) {
            whereClause.created_at = {
                gte: new Date(start_date),
                lte: new Date(new Date(end_date).setHours(23, 59, 59)),
            };
        } else if (start_date) {
            whereClause.created_at = {
                gte: new Date(start_date),
                lte: new Date(new Date(start_date).setHours(23, 59, 59)),
            };
        }

        // Employee filter
        if (employee_id) {
            whereClause.assigned_to = parseInt(employee_id);
        }

        // Project filter
        if (project_id) {
            whereClause.project_id = parseInt(project_id);
        }

        // Status filter
        if (status) {
            // Mapping status string to boolean/logic if needed, or if stored as string in DB
            // Assuming status is stored as string '1', '2' etc or specific field on task_status
            // For tasks table check:
            // 1: Created, 2: InProgress, 3: QA, 4: Repeat, 5: Completed, 6: Closed
            // Since status logic is complex with task_status table, we might filter simpler on tasks table if field exists
            // BUT schema shows tasks table has no simple status field, it relies on task_status table linkage.
            // Simpler approach for report: Join with latest task_status
        }

        // Fetch tasks
        const tasks = await prisma.tasks.findMany({
            where: whereClause,
            include: {
                project: {
                    select: { project_name: true }
                },
                assigned_user: {
                    select: { name: true }
                },
                module: {
                    select: { module_name: true }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Enhance data with calculated fields if necessary
        const reportData = tasks.map(task => ({
            task_code: task.task_code,
            task_name: task.task_name,
            project_name: task.project?.project_name || 'N/A',
            module_name: task.module?.module_name || 'N/A',
            assigned_to: task.assigned_user?.name || 'Unassigned',
            priority: task.task_priority,
            description: task.description,
            created_at: task.created_at,
        }));

        return NextResponse.json(reportData);
    } catch (error) {
        console.error('Error fetching daily report:', error);
        return NextResponse.json(
            { message: 'Failed to fetch daily report' },
            { status: 500 }
        );
    }
}
