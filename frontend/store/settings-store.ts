import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface SettingsState {
    theme: Theme;
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    sidebarCollapsed: boolean;
    setTheme: (theme: Theme) => void;
    setLanguage: (lang: string) => void;
    setTimezone: (zone: string) => void;
    toggleEmailNotifications: () => void;
    togglePushNotifications: () => void;
    toggleSidebar: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            emailNotifications: true,
            pushNotifications: true,
            sidebarCollapsed: false,
            setTheme: (theme) => set({ theme }),
            setLanguage: (language) => set({ language }),
            setTimezone: (timezone) => set({ timezone }),
            toggleEmailNotifications: () => set((state) => ({ emailNotifications: !state.emailNotifications })),
            togglePushNotifications: () => set((state) => ({ pushNotifications: !state.pushNotifications })),
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        }),
        {
            name: 'settings-storage',
        }
    )
);
