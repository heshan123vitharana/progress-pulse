import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });
        }

        const user = await prisma.users.findFirst({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found in DB' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                message: 'Invalid password',
                debug: {
                    providedPassword: password,
                    storedHash: user.password
                }
            }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            message: 'Login successful!',
            user: {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
                role_id: user.role_id ? user.role_id.toString() : null
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: 'Server caught error', error: error.message }, { status: 500 });
    }
}
