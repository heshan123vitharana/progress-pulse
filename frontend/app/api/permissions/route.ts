import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const permissions = await prisma.permissions.findMany({
            orderBy: { name: 'asc' }
        });

        const formatted = permissions.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            slug: p.slug
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch permissions', error: error.message },
            { status: 500 }
        );
    }
}
