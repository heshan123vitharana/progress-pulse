import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Session } from 'next-auth';

/**
 * Session with user information
 */
export interface AuthSession extends Session {
    user: {
        id: string;
        email: string;
        name: string;
        role?: string;
    };
}

/**
 * Verify user is authenticated
 * Returns session if authenticated, throws error if not
 */
export async function requireAuth(): Promise<AuthSession> {
    const session = await getServerSession(authOptions) as AuthSession;

    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    return session;
}

/**
 * Check if user is authenticated
 * Returns session or null without throwing
 */
export async function getAuth(): Promise<AuthSession | null> {
    const session = await getServerSession(authOptions) as AuthSession;
    return session?.user?.id ? session : null;
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
    return NextResponse.json(
        {
            success: false,
            message,
            code: 'UNAUTHORIZED'
        },
        { status: 401 }
    );
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
    return NextResponse.json(
        {
            success: false,
            message,
            code: 'FORBIDDEN'
        },
        { status: 403 }
    );
}
