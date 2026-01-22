'use client';

import { SessionProvider } from "next-auth/react";
import { AuthSync } from "./AuthSync";
import { useSettingsStore } from "@/store/settings-store";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const { theme } = useSettingsStore();

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = () => {
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        applyTheme();
    }, [theme]);

    return (
        <SessionProvider>
            <AuthSync />
            {children}
        </SessionProvider>
    );
}
