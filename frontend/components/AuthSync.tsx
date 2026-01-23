'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/auth-store';
import { User } from '@/types';

export function AuthSync() {
    const { data: session, status } = useSession();
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            // Map NextAuth user to our application User type
            const appUser: User = {
                id: Number(session.user.id),
                name: session.user.name || '',
                email: session.user.email || '',
                employee_id: session.user.employee_id || undefined,
                role_id: session.user.role_id || undefined,
                avatar: session.user.avatar || undefined,
                // Default values for required fields not in session
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // In a real app we might use the JWT token here
            // For now we'll pass a dummy token since NextAuth handles the actual auth
            login('session-token', appUser);
        } else if (status === 'unauthenticated') {
            logout();
        }
    }, [session, status, login, logout]);

    return null;
}
