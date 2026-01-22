import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface SettingsState {
    theme: Theme;
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    setTheme: (theme: Theme) => void;
    setLanguage: (lang: string) => void;
    setTimezone: (zone: string) => void;
    toggleEmailNotifications: () => void;
    togglePushNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            emailNotifications: true,
            pushNotifications: true,
            setTheme: (theme) => set({ theme }),
            setLanguage: (language) => set({ language }),
            setTimezone: (timezone) => set({ timezone }),
            toggleEmailNotifications: () => set((state) => ({ emailNotifications: !state.emailNotifications })),
            togglePushNotifications: () => set((state) => ({ pushNotifications: !state.pushNotifications })),
        }),
        {
            name: 'settings-storage',
        }
    )
);
