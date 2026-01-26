import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const projectSchema = z.object({
    project_name: z.string().min(1).max(255),
    project_code: z.string().max(50).optional().nullable(),
    client_name: z.string().max(255).optional().nullable(),
    client_email: z.string().email().max(255).optional().or(z.literal('')).nullable(),
    start_date: z.string().optional().nullable(), // Date string
    end_date: z.string().optional().nullable(),
    status: z.enum(['planned', 'in_progress', 'completed', 'on_hold', 'cancelled']).optional().nullable(), // Adjusted enum based on likely values, will defaults to 'planned'
    customer_id: z.number().optional().nullable(), // Added relation support if needed
});

export async function GET(request: Request) {
    try {
        const projects = await prisma.projects.findMany({
            orderBy: { project_name: 'asc' },
            include: { customer: true }
        });

        const safeProjects = JSON.parse(JSON.stringify(projects, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeProjects });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch projects', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Project Creation Request Body:", body);
        const validated = projectSchema.parse(body);

        // Auto-generate project code if not provided
        let finalProjectCode = validated.project_code;
        if (!finalProjectCode) {
            const lastProject = await prisma.projects.findFirst({
                orderBy: { created_at: 'desc' },
                select: { project_code: true }
            });

            let nextNum = 1;
            if (lastProject && lastProject.project_code) {
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
                // Manual mapping if field names differ or for specific logic
                customer_id: validated.customer_id ? BigInt(validated.customer_id) : undefined,
                start_date: validated.start_date ? new Date(validated.start_date) : null,
                end_date: validated.end_date ? new Date(validated.end_date) : null,
                status: (validated.status as any) || 'planned',
                created_at: new Date(),
                updated_at: new Date()
            },
        });

        const safeProject = JSON.parse(JSON.stringify(newProject, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(
            { success: true, message: 'Project created successfully', data: safeProject },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            console.error("Project Validation Error:", error.flatten().fieldErrors);
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create project', error: error.message },
            { status: 500 }
        );
    }
}
