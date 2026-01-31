import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        let employee_id = searchParams.get('employee_id');
        const start_date = searchParams.get('start_date');
        const end_date = searchParams.get('end_date');
        const role_slug = session.user.role_slug;

        // Security: Restrict non-admins to their own data
        if (role_slug !== 'admin') {
            if (!session.user.employee_id) {
                return NextResponse.json(
                    { message: 'Employee ID not found for user' },
                    { status: 403 }
                );
            }
            employee_id = String(session.user.employee_id);
        }

        const whereClause: any = {};
        if (employee_id) {
            whereClause.assigned_to = parseInt(employee_id);
        }

        // Date Filtering
        if (start_date && end_date) {
            whereClause.updated_at = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }

        // Fetch basic counts
        const [
            totalTasks,
            activeTasks,
            completedTasks,
            highPriorityTasks,
            totalEmployees,
        ] = await prisma.$transaction([
            prisma.tasks.count({ where: whereClause }),
            prisma.tasks.count({
                where: {
                    ...whereClause,
                    is_accepted: true,
                    status: { notIn: ['5', '6'] } // Excluding Completed/Closed
                }
            }),
            prisma.tasks.count({
                where: {
                    ...whereClause,
                    status: { in: ['5', '6'] } // Completed or Closed
                }
            }),
            prisma.tasks.count({
                where: {
                    ...whereClause,
                    task_priority: 1
                }
            }),
            prisma.employees.count()
        ]);

        // Calculate Performance Metrics
        let completionRate = 0;
        let onTimeDelivery = 0;
        let productivity = 0;

        if (totalTasks > 0) {
            // Completion Rate: (Completed + Closed) / Total
            completionRate = Math.round((completedTasks / totalTasks) * 100);

            // Productivity: (Active + Completed) / Total (Engagement rate)
            const engagedTasks = activeTasks + completedTasks;
            productivity = Math.round((engagedTasks / totalTasks) * 100);

            // On-Time Delivery: Need to check due_dates of completed tasks
            // Fetching necessary fields for calculation
            const completedTasksData = await prisma.tasks.findMany({
                where: {
                    ...whereClause,
                    status: { in: ['5', '6'] },
                    due_date: { not: null }
                },
                select: {
                    due_date: true,
                    updated_at: true, // Using updated_at as completion time proxy
                    accepted_at: true
                }
            });

            if (completedTasksData.length > 0) {
                const onTimeCount = completedTasksData.filter(task => {
                    if (!task.due_date || !task.updated_at) return false;
                    const dueDate = new Date(task.due_date);
                    const completedDate = new Date(task.updated_at);
                    // Compare dates (ignoring time for due date typically, but assuming end of day)
                    dueDate.setHours(23, 59, 59, 999);
                    return completedDate <= dueDate;
                }).length;

                onTimeDelivery = Math.round((onTimeCount / completedTasksData.length) * 100);
            } else {
                onTimeDelivery = 100; // Default to 100% if no completed tasks with due dates? Or 0? Let's say 100 for optimism if no overdue.
                // Actually if 0 completed tasks, let's keep it 0 or null.
                if (completedTasks === 0) onTimeDelivery = 0;
            }
        }

        return NextResponse.json({
            // Basic Counters
            total_tasks: totalTasks,
            active_tasks: activeTasks,
            completed_tasks: completedTasks,
            high_priority_tasks: highPriorityTasks,
            total_employees: totalEmployees,
            active_employees: totalEmployees, // Proxy for now

            // Performance Metrics
            performance: {
                completion_rate: completionRate,
                productivity: productivity,
                on_time_delivery: onTimeDelivery
            }
        });

    } catch (error: any) {
        console.error('Dashboard count error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch dashboard counts', error: error.message },
            { status: 500 }
        );
    }
}
