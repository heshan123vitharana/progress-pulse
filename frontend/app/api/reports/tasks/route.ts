import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start_date = searchParams.get('start_date');
        const end_date = searchParams.get('end_date');
        const project_id = searchParams.get('project_id');

        const whereClause: any = {};

        if (start_date && end_date) {
            whereClause.created_at = {
                gte: new Date(start_date),
                lte: new Date(new Date(end_date).setHours(23, 59, 59)),
            };
        }

        if (project_id) {
            whereClause.project_id = parseInt(project_id);
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
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const reportData = tasks.map(task => ({
            task_code: task.task_code,
            task_name: task.task_name,
            project_name: task.project?.project_name || 'N/A',
            assigned_to: task.assigned_user?.name || 'Unassigned',
            priority: task.task_priority,
            status: task.is_accepted ? 'Accepted' : 'Pending', // Simplified status for summary
            created_at: task.created_at,
        }));

        return NextResponse.json(reportData);
    } catch (error) {
        console.error('Error fetching task report:', error);
        return NextResponse.json(
            { message: 'Failed to fetch task report' },
            { status: 500 }
        );
    }
}
