import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get a specific user
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = id;

        const user = await prisma.users.findUnique({
            where: { id: BigInt(userId) },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role_id: user.role_id?.toString(),
                status: user.status,
                created_at: user.created_at,
            }
        });

    } catch (error: any) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch user', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update a user (including role assignment)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = id;
        const body = await request.json();
        const { name, email, role_id, status } = body;

        // Check if user exists
        const existingUser = await prisma.users.findUnique({
            where: { id: BigInt(userId) },
        });

        if (!existingUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Build update data
        const updateData: any = {
            updated_at: new Date(),
        };

        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (status !== undefined) updateData.status = status;
        if (role_id !== undefined) {
            updateData.role_id = role_id ? BigInt(role_id) : null;
        }

        // Update user
        const updatedUser = await prisma.users.update({
            where: { id: BigInt(userId) },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            message: 'User updated successfully',
            data: {
                id: updatedUser.id.toString(),
                name: updatedUser.name,
                email: updatedUser.email,
                role_id: updatedUser.role_id?.toString(),
                status: updatedUser.status,
            }
        });

    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update user', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete a user
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = id;

        await prisma.users.delete({
            where: { id: BigInt(userId) },
        });

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete user', error: error.message },
            { status: 500 }
        );
    }
}
