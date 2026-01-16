import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const moduleSchema = z.object({
    project_id: z.number().int().positive(), // Validating ID existence is better done via DB Check if needed
    module_name: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    status: z.enum(['draft', 'active', 'completed', 'archived']).optional().nullable(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('project_id');

        let whereClause = {};
        if (projectId) {
            whereClause = { project_id: parseInt(projectId) };
        }

        const modules = await prisma.modules.findMany({
            where: whereClause,
            include: {
                project: true,
                objects: true,
            },
            orderBy: { created_at: 'desc' },
        });

        const safeModules = JSON.parse(JSON.stringify(modules, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeModules });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch modules', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Manual cast or parsing for BigInt if needed, but standard JSON usually passes numbers. 
        // Zod expects number for project_id.
        const validated = moduleSchema.parse(body);

        const checkProject = await prisma.projects.findUnique({
            where: { project_id: BigInt(validated.project_id) }
        });

        if (!checkProject) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: { project_id: ['The selected project id is invalid.'] } },
                { status: 422 }
            );
        }

        const newModule = await prisma.modules.create({
            data: {
                project_id: BigInt(validated.project_id),
                module_name: validated.module_name,
                description: validated.description,
                status: validated.status as any,
            },
        });

        // Load relations (fetch again)
        const ModuleWithRelations = await prisma.modules.findUnique({
            where: { id: newModule.id },
            include: { project: true, objects: true }
        });

        const safeModule = JSON.parse(JSON.stringify(ModuleWithRelations, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(
            { success: true, message: 'Module created successfully', data: safeModule },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create module', error: error.message },
            { status: 500 }
        );
    }
}
