import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'customer-portal-secret-key'
);

// Verify customer token using jose
async function verifyCustomerToken(token: string): Promise<{ customer_id: string } | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.type !== 'customer') return null;
        return { customer_id: payload.customer_id as string };
    } catch {
        return null;
    }
}

// GET - Fetch customer's tasks
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = await verifyCustomerToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const customerId = BigInt(decoded.customer_id);

        // Fetch customer tasks - using any to bypass Prisma type issue
        const customerTasks: any[] = await (prisma as any).customer_tasks.findMany({
            where: { customer_id: customerId },
            orderBy: { created_at: 'desc' },
            include: {
                customer: {
                    include: {
                        projects: {
                            select: {
                                project_id: true,
                                project_name: true
                            }
                        }
                    }
                }
            }
        });

        // Calculate stats
        const stats = {
            total: customerTasks.length,
            pending: customerTasks.filter((t: any) => t.status === 'pending').length,
            in_progress: customerTasks.filter((t: any) => t.status === 'in_progress').length,
            completed: customerTasks.filter((t: any) => t.status === 'completed').length,
        };

        // Format tasks for response
        const tasks = customerTasks.map((t: any) => ({
            id: t.id.toString(),
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: t.status,
            screenshots: t.screenshots,
            created_at: t.created_at,
        }));

        return NextResponse.json({
            success: true,
            data: { tasks, stats }
        });

    } catch (error: any) {
        console.error('Error fetching customer tasks:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch tasks', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new customer task (issue report)
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = await verifyCustomerToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const customerId = BigInt(decoded.customer_id);
        const body = await request.json();
        const { title, description, priority, project_id, screenshots } = body;

        if (!title) {
            return NextResponse.json(
                { success: false, message: 'Title is required' },
                { status: 400 }
            );
        }

        // Create customer task - using any to bypass Prisma type issue
        const newTask = await (prisma as any).customer_tasks.create({
            data: {
                customer_id: customerId,
                project_id: project_id ? BigInt(project_id) : null,
                title,
                description: description || '',
                priority: priority || 1,
                status: 'pending',
                screenshots: screenshots || null,
                created_at: new Date(),
                updated_at: new Date(),
            }
        });

        // Create notification for internal users
        try {
            // Get customer info for notification
            const customer = await prisma.customers.findUnique({
                where: { customer_id: customerId }
            });

            // Create notification for admins/managers
            await prisma.notifications.create({
                data: {
                    id: crypto.randomUUID(),
                    type: 'customer_task_created',
                    notifiable_type: 'App\\Models\\User',
                    notifiable_id: BigInt(1), // Will be changed to notify relevant users
                    data: JSON.stringify({
                        message: `New issue reported by ${customer?.customer_name || 'Customer'}`,
                        title: title,
                        customer_task_id: newTask.id.toString(),
                        customer_name: customer?.customer_name,
                        priority: priority
                    }),
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
            // Don't fail the request if notification fails
        }

        return NextResponse.json({
            success: true,
            message: 'Issue reported successfully! Our team will review it shortly.',
            data: {
                id: newTask.id.toString(),
                title: newTask.title,
                status: newTask.status
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating customer task:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to submit issue', error: error.message },
            { status: 500 }
        );
    }
}
