import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get a specific customer
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const customerId = parseInt(id);

        if (isNaN(customerId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid customer ID' },
                { status: 400 }
            );
        }

        // Simple query without include
        const customer = await prisma.customers.findUnique({
            where: { customer_id: BigInt(customerId) },
        });

        if (!customer) {
            return NextResponse.json(
                { success: false, message: 'Customer not found' },
                { status: 404 }
            );
        }

        // Convert BigInt to string for JSON serialization
        const safeCustomer = {
            customer_id: customer.customer_id.toString(),
            customer_code: customer.customer_code,
            customer_name: customer.customer_name,
            company: customer.company,
            email: customer.email,
            mobile_phone: customer.mobile_phone,
            address: customer.address,
            status: customer.status,
            created_at: customer.created_at,
            updated_at: customer.updated_at,
        };

        return NextResponse.json({ success: true, data: safeCustomer });

    } catch (error: any) {
        console.error('Error fetching customer:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch customer', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update a customer
export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const customerId = parseInt(id);

        if (isNaN(customerId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid customer ID' },
                { status: 400 }
            );
        }

        const body = await request.json();

        // Check if customer exists
        const existingCustomer = await prisma.customers.findUnique({
            where: { customer_id: BigInt(customerId) },
        });

        if (!existingCustomer) {
            return NextResponse.json(
                { success: false, message: 'Customer not found' },
                { status: 404 }
            );
        }

        // Build update data
        const updateData: any = {
            updated_at: new Date(),
        };

        if (body.customer_code !== undefined) updateData.customer_code = body.customer_code;
        if (body.customer_name !== undefined) updateData.customer_name = body.customer_name;
        if (body.company !== undefined) updateData.company = body.company;
        if (body.email !== undefined) updateData.email = body.email || null;
        if (body.mobile_phone !== undefined) updateData.mobile_phone = body.mobile_phone;
        if (body.address !== undefined) updateData.address = body.address;
        if (body.status !== undefined) updateData.status = body.status;

        const updatedCustomer = await prisma.customers.update({
            where: { customer_id: BigInt(customerId) },
            data: updateData,
        });

        const safeCustomer = {
            customer_id: updatedCustomer.customer_id.toString(),
            customer_code: updatedCustomer.customer_code,
            customer_name: updatedCustomer.customer_name,
            company: updatedCustomer.company,
            email: updatedCustomer.email,
            mobile_phone: updatedCustomer.mobile_phone,
            address: updatedCustomer.address,
            status: updatedCustomer.status,
        };

        return NextResponse.json({
            success: true,
            message: 'Customer updated successfully',
            data: safeCustomer
        });

    } catch (error: any) {
        console.error('Error updating customer:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update customer', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete a customer
export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const customerId = parseInt(id);

        if (isNaN(customerId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid customer ID' },
                { status: 400 }
            );
        }

        // Check if customer exists
        const existingCustomer = await prisma.customers.findUnique({
            where: { customer_id: BigInt(customerId) },
        });

        if (!existingCustomer) {
            return NextResponse.json(
                { success: false, message: 'Customer not found' },
                { status: 404 }
            );
        }

        // Check for related projects
        const projectCount = await prisma.projects.count({
            where: { customer_id: BigInt(customerId) }
        });

        if (projectCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot delete customer. ${projectCount} project(s) are associated with this customer. Please remove or reassign them first.`
                },
                { status: 400 }
            );
        }

        // Delete customer
        await prisma.customers.delete({
            where: { customer_id: BigInt(customerId) },
        });

        return NextResponse.json({
            success: true,
            message: 'Customer deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting customer:', error);

        if (error.code === 'P2003' || error.code === 'P2014') {
            return NextResponse.json(
                { success: false, message: 'Cannot delete customer - there are related records.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to delete customer', error: error.message },
            { status: 500 }
        );
    }
}
