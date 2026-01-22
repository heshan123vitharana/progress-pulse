import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'customer-portal-secret-key'
);

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find customer by email - using any to bypass Prisma type issue until client is regenerated
        const customer: any = await (prisma.customers as any).findFirst({
            where: {
                email: email,
                portal_status: 'active'
            },
            include: {
                projects: true
            }
        });

        if (!customer) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials or portal access not enabled' },
                { status: 401 }
            );
        }

        if (!customer.portal_password) {
            return NextResponse.json(
                { success: false, message: 'Portal access not configured. Contact administrator.' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, customer.portal_password);
        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Update last login
        await (prisma.customers as any).update({
            where: { customer_id: customer.customer_id },
            data: { portal_last_login: new Date() }
        });

        // Generate JWT token using jose
        const token = await new SignJWT({
            customer_id: customer.customer_id.toString(),
            email: customer.email,
            type: 'customer'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        // Return customer data (without password)
        const customerData = {
            customer_id: customer.customer_id.toString(),
            customer_code: customer.customer_code,
            customer_name: customer.customer_name,
            company: customer.company,
            email: customer.email,
            projects: (customer.projects || []).map((p: any) => ({
                project_id: p.project_id.toString(),
                project_name: p.project_name
            }))
        };

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                customer: customerData
            }
        });

    } catch (error: any) {
        console.error('Customer login error:', error);
        return NextResponse.json(
            { success: false, message: 'Login failed', error: error.message },
            { status: 500 }
        );
    }
}
