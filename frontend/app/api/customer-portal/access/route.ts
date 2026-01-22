import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Enable/disable customer portal access
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customer_id, portal_password, portal_status } = body;

        if (!customer_id) {
            return NextResponse.json(
                { success: false, message: 'Customer ID is required' },
                { status: 400 }
            );
        }

        const updateData: any = {
            portal_status: portal_status || 'active',
            updated_at: new Date(),
        };

        // If password provided, hash it
        if (portal_password) {
            updateData.portal_password = await bcrypt.hash(portal_password, 10);
        }

        const customer = await prisma.customers.update({
            where: { customer_id: BigInt(customer_id) },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            message: portal_status === 'inactive'
                ? 'Portal access disabled'
                : 'Portal access enabled successfully',
            data: {
                customer_id: customer.customer_id.toString(),
                portal_status: customer.portal_status,
            }
        });

    } catch (error: any) {
        console.error('Error updating portal access:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update portal access', error: error.message },
            { status: 500 }
        );
    }
}

// GET - Check portal access status for a customer
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customer_id');

        if (!customerId) {
            return NextResponse.json(
                { success: false, message: 'Customer ID is required' },
                { status: 400 }
            );
        }

        const customer = await prisma.customers.findUnique({
            where: { customer_id: BigInt(customerId) },
            select: {
                customer_id: true,
                customer_name: true,
                email: true,
                portal_status: true,
                portal_last_login: true,
            }
        });

        if (!customer) {
            return NextResponse.json(
                { success: false, message: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                customer_id: customer.customer_id.toString(),
                customer_name: customer.customer_name,
                email: customer.email,
                portal_status: customer.portal_status,
                portal_last_login: customer.portal_last_login,
                has_portal_access: customer.portal_status === 'active',
            }
        });

    } catch (error: any) {
        console.error('Error checking portal access:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to check portal access', error: error.message },
            { status: 500 }
        );
    }
}
