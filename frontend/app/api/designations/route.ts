import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation Schema matches DesignationController.php
const designationSchema = z.object({
    designation_name: z.string().min(1).max(255), // Maps to 'designation'
    description: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']),
});

export async function GET() {
    try {
        const designations = await prisma.designations.findMany({
            orderBy: { designation: 'asc' }, // Matches orderBy('designation')
        });
        const safeDesignations = JSON.parse(JSON.stringify(designations, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        // Map to match frontend interface
        const mappedDesignations = safeDesignations.map((d: any) => ({
            ...d,
            designation_name: d.designation
        }));

        return NextResponse.json({ success: true, data: mappedDesignations });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch designations', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = designationSchema.parse(body);

        // Check uniqueness (Laravel: unique:designations,designation)
        const existing = await prisma.designations.findFirst({
            where: { designation: validated.designation_name }
        });
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: { designation_name: ['The designation name has already been taken.'] } },
                { status: 422 }
            );
        }

        const newDesignation = await prisma.designations.create({
            data: {
                designation: validated.designation_name,
                description: validated.description,
                status: validated.status as any, // enum cast
            },
        });

        const safeNewDesignation = JSON.parse(JSON.stringify(newDesignation, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(
            { success: true, message: 'Designation created successfully', data: safeNewDesignation },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create designation', error: error.message },
            { status: 500 }
        );
    }
}
