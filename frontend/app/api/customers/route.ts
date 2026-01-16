import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation Schema
const customerSchema = z.object({
    customer_code: z.string().optional(),
    customer_name: z.string().min(1, "Customer name is required").max(255),
    company: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    mobile_phone: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
});

export async function GET() {
    try {
        const customers = await prisma.customers.findMany({
            orderBy: { customer_name: 'asc' },
        });

        const safeCustomers = JSON.parse(JSON.stringify(customers, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ success: true, data: safeCustomers });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch customers', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validated = customerSchema.parse(body);

        // Check uniqueness if email is provided
        if (validated.email) {
            const existing = await prisma.customers.findFirst({
                where: { email: validated.email }
            });

            if (existing) {
                return NextResponse.json(
                    { success: false, message: 'Validation failed', errors: { email: ['The email has already been taken.'] } },
                    { status: 422 }
                );
            }
        }

        const newCustomer = await prisma.customers.create({
            data: {
                customer_code: validated.customer_code,
                customer_name: validated.customer_name,
                company: validated.company,
                email: validated.email,
                mobile_phone: validated.mobile_phone,
                address: validated.address,
                status: validated.status,
            },
        });

        const safeNewCustomer = JSON.parse(JSON.stringify(newCustomer, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json(
            { success: true, message: 'Customer created successfully', data: safeNewCustomer },
            { status: 201 }
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 422 });
        }
        return NextResponse.json(
            { success: false, message: 'Failed to create customer', error: error.message },
            { status: 500 }
        );
    }
}
