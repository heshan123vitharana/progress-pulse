import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (token: string, user: User) => {
                // Store token in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                }
                set({ token, user, isAuthenticated: true });
            },

            logout: () => {
                // Clear token from localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
                set({ token: null, user: null, isAuthenticated: false });
            },

            setUser: (user: User) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(user));
                }
                set({ user });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
