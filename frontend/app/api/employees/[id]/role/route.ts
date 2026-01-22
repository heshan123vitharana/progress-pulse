import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Update employee's role (for permission management)
export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const employeeId = id;
        const body = await request.json();
        const { role_id } = body;

        // Find the employee
        const employee = await prisma.employees.findUnique({
            where: { employee_id: BigInt(employeeId) },
        });

        if (!employee) {
            return NextResponse.json(
                { success: false, message: 'Employee not found' },
                { status: 404 }
            );
        }

        // Find the user associated with this employee
        const user = await prisma.users.findFirst({
            where: { employee_id: parseInt(employeeId) },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'No user account found for this employee. Please create a user account first.' },
                { status: 400 }
            );
        }

        // Update the user's role
        await prisma.users.update({
            where: { id: user.id },
            data: {
                role_id: role_id ? BigInt(role_id) : null,
                updated_at: new Date(),
            },
        });

        // Also update the employee record if it has a role field
        await prisma.employees.update({
            where: { employee_id: BigInt(employeeId) },
            data: {
                updated_at: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Role updated successfully',
            data: {
                employee_id: employeeId,
                role_id: role_id,
            }
        });

    } catch (error: any) {
        console.error('Error updating employee role:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update role', error: error.message },
            { status: 500 }
        );
    }
}

// GET - Get employee's role
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const employeeId = id;

        // Find the user associated with this employee
        const user = await prisma.users.findFirst({
            where: { employee_id: parseInt(employeeId) },
        });

        if (!user) {
            return NextResponse.json({
                success: true,
                data: { role: null, message: 'No user account linked to this employee' }
            });
        }

        // Get role info
        let role = null;
        if (user.role_id) {
            role = await prisma.roles.findUnique({
                where: { id: user.role_id },
            });
        }

        const safeRole = role ? JSON.parse(JSON.stringify(role, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )) : null;

        return NextResponse.json({
            success: true,
            data: {
                user_id: user.id.toString(),
                role: safeRole,
            }
        });

    } catch (error: any) {
        console.error('Error fetching employee role:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch role', error: error.message },
            { status: 500 }
        );
    }
}
