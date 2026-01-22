'use client';

import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const {
        theme, setTheme,
        language, setLanguage,
        timezone, setTimezone,
        emailNotifications, toggleEmailNotifications,
        pushNotifications, togglePushNotifications
    } = useSettingsStore();

    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    return (
        <Sidebar>
            <div className="p-6 lg:p-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-500/30">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                        <p className="text-slate-500">Manage application preferences</p>
                    </div>
                </div>

                <div className="grid gap-8">
                    {/* General Settings */}
                    <div className="bg-white/70 dark:bg-[var(--background)]/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 lg:p-8 transition-colors">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            General
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 dark:text-white transition-colors"
                                >
                                    <option value="en">English (US)</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 dark:text-white transition-colors"
                                >
                                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                                    <option value="EST">EST (Eastern Standard Time)</option>
                                    <option value="PST">PST (Pacific Standard Time)</option>
                                    <option value="IST">IST (Indian Standard Time)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white/70 dark:bg-[var(--background)]/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 lg:p-8 transition-colors">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">Email Notifications</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive updates and alerts via email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={emailNotifications}
                                        onChange={toggleEmailNotifications}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                </label>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">Push Notifications</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive real-time notifications on your device</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={pushNotifications}
                                        onChange={togglePushNotifications}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="bg-white/70 dark:bg-[var(--background)]/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 lg:p-8 transition-colors">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Appearance
                        </h2>
                        <div>
                            <p className="font-medium text-slate-800 dark:text-white mb-3">Theme Preference</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800'}`}
                                >
                                    <div className="w-full h-12 bg-white rounded-lg shadow-sm border border-slate-100 mb-2"></div>
                                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800'}`}
                                >
                                    <div className="w-full h-12 bg-slate-800 rounded-lg shadow-sm mb-2"></div>
                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>Dark</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition-all shadow-lg">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
