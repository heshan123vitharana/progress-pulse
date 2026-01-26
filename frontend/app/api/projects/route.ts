import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const projectSchema = z.object({
    project_name: z.string().min(1).max(255),
    project_code: z.string().max(50).optional().or(z.literal('')).nullable(),
    description: z.string().optional().or(z.literal('')).nullable(),
    client_id: z.number().optional().nullable(), // Frontend sends client_id
    start_date: z.string().optional().or(z.literal('')).nullable(),
    end_date: z.string().optional().or(z.literal('')).nullable(),
    status: z.enum(['planned', 'active', 'in_progress', 'completed', 'on_hold', 'cancelled']).optional().nullable(),
    supervised_by_id: z.number().optional().nullable(),
    developers: z.array(z.number()).optional().nullable(),
    support_team: z.array(z.number()).optional().nullable(),
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
                customer_id: validated.client_id ? BigInt(validated.client_id) : null,
                start_date: validated.start_date ? new Date(validated.start_date) : null,
                end_date: validated.end_date ? new Date(validated.end_date) : null,
                status: (validated.status as any) || 'planned',
                supervised_by_id: validated.supervised_by_id ? BigInt(validated.supervised_by_id) : null,
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
