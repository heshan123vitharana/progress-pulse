import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get permissions for a specific user based on their role
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // First get the user to find their role_id
        const user = await prisma.users.findUnique({
            where: { id: BigInt(userId) },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // If user has no role_id, return empty permissions
        if (!user.role_id) {
            return NextResponse.json({
                success: true,
                data: [],
                role: null
            });
        }

        // Get the role
        const role = await prisma.roles.findUnique({
            where: { id: user.role_id },
        });

        if (!role) {
            return NextResponse.json({
                success: true,
                data: [],
                role: null
            });
        }

        // Get role permissions
        const rolePermissions = await prisma.roles_permissions.findMany({
            where: { role_id: user.role_id },
        });

        // Get permission slugs
        let permissionSlugs: string[] = [];

        if (rolePermissions.length > 0) {
            const permissionIds = rolePermissions.map(rp => rp.permission_id);
            const permissions = await prisma.permissions.findMany({
                where: { id: { in: permissionIds } },
            });
            permissionSlugs = permissions.map(p => p.slug);
        }

        return NextResponse.json({
            success: true,
            data: permissionSlugs,
            role: {
                id: role.id.toString(),
                name: role.name,
                slug: role.slug
            }
        });

    } catch (error: any) {
        console.error('Error fetching user permissions:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch permissions', error: error.message },
            { status: 500 }
        );
    }
}
