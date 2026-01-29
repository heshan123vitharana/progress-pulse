'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { toast } from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import api from '@/lib/api';

// Navigation items with required permissions
const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', permissions: ['view_dashboard'] },
    { name: 'Employees', href: '/employees', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', permissions: ['view_employees'] },
    { name: 'Designations', href: '/designations', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permissions: ['manage_designations'] },
    { name: 'Tasks', href: '/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', permissions: ['view_tasks'] },
    { name: 'Timesheet', href: '/timesheet', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', permissions: ['view_timesheet'] },
    { name: 'Projects', href: '/projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', permissions: ['view_projects'] },
    { name: 'Modules', href: '/modules', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', permissions: ['view_modules'] },
    { name: 'Objects', href: '/objects', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', permissions: ['view_objects'] },
    { name: 'Customers', href: '/customers', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', permissions: ['view_customers'] },
    { name: 'Departments', href: '/departments', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', permissions: ['manage_departments'] },

    { name: 'Reports', href: '/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permissions: ['view_reports'] },
    { name: 'Analytics', href: '/analytics', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', permissions: ['view_analytics'] },
    { name: 'Users', href: '/users', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', permissions: ['manage_users'] },
    { name: 'Roles', href: '/roles', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', permissions: ['manage_roles'] },
    { name: 'Activity Logs', href: '/activity-logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', permissions: ['view_activity_logs'] },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { sidebarCollapsed, toggleSidebar } = useSettingsStore();

    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const prevNotificationCountRef = useRef(0);

    // Effect to play sound when notification count increases
    useEffect(() => {
        if (notificationCount > prevNotificationCountRef.current) {
            try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => {
                    // Audio play might fail if user strict interaction policy, or file missing
                    console.log('Notification sound failed to play:', e);
                });
            } catch (e) {
                console.error('Error handling notification sound:', e);
            }
        }
        prevNotificationCountRef.current = notificationCount;
    }, [notificationCount]);

    const fetchNotifications = async () => {
        setNotificationsLoading(true);
        try {
            const res = await api.get('/notifications');
            setNotifications(Array.isArray(res.data) ? res.data : res.data.data || []);

            // Also update count
            const countRes = await api.get('/notifications/count');
            if (countRes.data.success) {
                setNotificationCount(countRes.data.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
        setNotificationsLoading(false);
    };

    const markAsRead = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setNotificationCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setNotificationCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    // Fetch user permissions based on their role
    useEffect(() => {
        const fetchUserPermissions = async () => {
            if (!user?.id) {
                // No user logged in, show all items until auth is confirmed
                return;
            }

            // Check if user has role_id 1 (admin) - common admin role ID
            // or role_id is not set (fallback to show all)
            if (!user.role_id || Number(user.role_id) === 1) {
                console.log('Admin user or no role, showing all menu items');
                setUserPermissions(['all']);
                return;
            }

            try {
                const response = await api.get(`/users/${user.id}/permissions`);
                if (response.data.success && response.data.data) {
                    const perms = response.data.data;
                    // If user has many permissions (like admin), set to 'all' for efficiency
                    if (perms.length >= 30) {
                        setUserPermissions(['all']);
                    } else {
                        setUserPermissions(perms);
                    }
                } else {
                    // API returned but no permissions - show all as fallback
                    setUserPermissions(['all']);
                }
            } catch (error) {
                // API error - show all menu items as fallback
                console.log('Using fallback permissions (showing all menu items)');
                setUserPermissions(['all']);
            }
        };
        fetchUserPermissions();
    }, [user?.id, user?.role_id]);

    // Filter navigation based on user permissions
    const filteredNavigation = useMemo(() => {
        // If user has 'all' permission or permissions not loaded yet, show all items
        if (userPermissions.includes('all') || userPermissions.length === 0) {
            return navigation;
        }

        return navigation.filter(item => {
            // If no permissions required, show item
            if (!item.permissions || item.permissions.length === 0) {
                return true;
            }
            // Check if user has at least one of the required permissions
            return item.permissions.some(perm => userPermissions.includes(perm));
        });
    }, [userPermissions]);

    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                const response = await api.get('/notifications/count');
                if (response.data.success) {
                    setNotificationCount(response.data.data.unreadCount);
                }
            } catch (error) {
                console.error('Error fetching notification count:', error);
            }
        };
        fetchNotificationCount();
        const interval = setInterval(fetchNotificationCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Real-time clock for Sri Lankan time
    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(clockInterval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownOpen) {
                setProfileDropdownOpen(false);
            }
            if (notificationDropdownOpen && !(event.target as Element).closest('.notification-container')) {
                setNotificationDropdownOpen(false);
            }
        };
        if (profileDropdownOpen || notificationDropdownOpen) {
            setTimeout(() => document.addEventListener('click', handleClickOutside), 100);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [profileDropdownOpen, notificationDropdownOpen]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Mobile sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-slate-950 shadow-2xl">
                        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
                            <div className="flex items-center space-x-3">
                                <img src="/rbs-logo-new.png" alt="Logo" className="h-9 w-auto" />
                                <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Progress Pulse</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                            {filteredNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${pathname === item.href
                                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10 border border-cyan-500/30'
                                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:z-50 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
                <div className="flex flex-col flex-1 bg-slate-950 shadow-2xl">
                    {/* Logo Header */}
                    <div className={`flex items-center h-16 px-4 border-b border-slate-700/50 bg-slate-950 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                        {!sidebarCollapsed && (
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                                    <img src="/rbs-logo-new.png" alt="Logo" className="relative h-10 w-auto" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent whitespace-nowrap">Progress Pulse</span>
                            </div>
                        )}
                        {sidebarCollapsed && (
                            <img src="/rbs-logo-new.png" alt="Logo" className="relative h-8 w-auto" />
                        )}

                        <button
                            onClick={toggleSidebar}
                            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all ${sidebarCollapsed
                                ? 'absolute left-full top-6 ml-3 bg-slate-800 border border-slate-700 shadow-md z-50'
                                : ''
                                }`}
                        >
                            <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                        {filteredNavigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative ${pathname === item.href
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10 border border-cyan-500/30'
                                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                    } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                                title={sidebarCollapsed ? item.name : ''}
                            >
                                <div className={`p-1.5 rounded-lg transition-all ${pathname === item.href
                                    ? 'bg-cyan-500/20'
                                    : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                                    } ${sidebarCollapsed ? 'mr-0' : 'mr-3'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                </div>
                                {!sidebarCollapsed && (
                                    <>
                                        <span className="truncate">{item.name}</span>
                                        {pathname === item.href && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                                        )}
                                    </>
                                )}
                                {/* Tooltip for collapsed state */}
                                {sidebarCollapsed && (
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700">
                                        {item.name}
                                        {/* Arrow */}
                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Support Contact */}
                    {!sidebarCollapsed && (
                        <div className="px-4 py-3 border-t border-slate-700/50">
                            <div className="flex items-center text-slate-400 text-xs">
                                <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-slate-500">Support:</span>
                            </div>
                            <div className="mt-1 ml-6 text-xs text-slate-400">
                                <p>+94 71 187 0575</p>
                                <p>+94 71 431 0100</p>
                            </div>
                        </div>
                    )}

                    {/* User Footer */}
                    <div className={`p-4 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                        <div className="flex items-center">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/25">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-full h-full rounded-xl object-cover" />
                                    ) : (
                                        user?.name?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                            </div>
                            {!sidebarCollapsed && (
                                <>
                                    <div className="flex-1 ml-3 overflow-hidden">
                                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            logout();
                                            toast.success('Logged out successfully');
                                            await signOut({ callbackUrl: '/login' });
                                        }}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all ml-1"
                                        title="Logout"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                {/* Top Header Bar */}
                <div className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 shadow-sm dark:shadow-slate-900/20 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all mr-3"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>


                    {/* Left side - Breadcrumb/Page Title */}
                    <div className="hidden sm:flex items-center">

                    </div>

                    {/* Center - Real-time Clock */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100/50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                            <svg className="w-3 h-3 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span
                                className="text-cyan-700 dark:text-cyan-400 text-xs font-medium tracking-wider"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                                suppressHydrationWarning
                            >
                                {currentTime.toLocaleTimeString('en-US', {
                                    timeZone: 'Asia/Colombo',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100/50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                            <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span
                                className="text-emerald-700 dark:text-emerald-400 text-xs font-medium tracking-wide"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                                {currentTime.toLocaleDateString('en-US', {
                                    timeZone: 'Asia/Colombo',
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Right side - Notifications & Profile */}
                    <div className="flex items-center space-x-3">
                        {/* Notification Bell */}
                        {/* Notification Bell */}
                        <div className="relative notification-container">
                            <button
                                onClick={() => {
                                    if (!notificationDropdownOpen) fetchNotifications();
                                    setNotificationDropdownOpen(!notificationDropdownOpen);
                                    setProfileDropdownOpen(false);
                                }}
                                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all group"
                            >
                                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse">
                                        {notificationCount > 99 ? '99+' : notificationCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {notificationDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-slate-900/50 py-2 z-50 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm overflow-hidden ring-1 ring-black ring-opacity-5">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                        {notifications.some(n => !n.read_at) && (
                                            <button
                                                onClick={markAllRead}
                                                className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-medium"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                                        {notificationsLoading ? (
                                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                                                Loading...
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <div className="bg-slate-100 dark:bg-slate-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                    </svg>
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">No notifications</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {notifications.map(n => {
                                                    let content = { title: 'Notification', message: 'No content', link: '#' };
                                                    try {
                                                        if (typeof n.data === 'string') {
                                                            content = JSON.parse(n.data);
                                                        } else if (typeof n.data === 'object' && n.data !== null) {
                                                            content = n.data;
                                                        }
                                                    } catch (e) {
                                                        console.error('Failed to parse notification data', e);
                                                    }

                                                    return (
                                                        <div
                                                            key={n.id}
                                                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read_at ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read_at ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-sm font-medium ${!n.read_at ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                        {content.title}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 line-clamp-2">
                                                                        {content.message}
                                                                    </p>
                                                                    <div className="flex justify-between items-center mt-2">
                                                                        <span className="text-[10px] text-slate-400">
                                                                            {new Date(n.created_at).toLocaleString('en-US', {
                                                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                                            })}
                                                                        </span>
                                                                        {!n.read_at && (
                                                                            <button
                                                                                onClick={(e) => markAsRead(n.id, e)}
                                                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                                            >
                                                                                Mark read
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href="/notifications"
                                        onClick={() => setNotificationDropdownOpen(false)}
                                        className="block text-center py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        View all notifications
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen); }}
                                className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all"
                            >
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/25">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-full h-full rounded-lg object-cover" />
                                        ) : (
                                            user?.name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-white hidden sm:block">{user?.name || 'Admin'}</span>
                                <svg className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Profile Dropdown */}
                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/50 py-2 z-50 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/settings"
                                            className="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            <svg className="w-4 h-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Settings
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
                                            onClick={() => setProfileDropdownOpen(false)}
                                        >
                                            <svg className="w-4 h-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            View Profile
                                        </Link>
                                    </div>
                                    <div className="border-t border-slate-700/50 pt-1">
                                        <button
                                            onClick={async () => {
                                                logout();
                                                toast.success('Logged out');
                                                setProfileDropdownOpen(false);
                                                await signOut({ callbackUrl: '/login' });
                                            }}
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-all"
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
            </div>
        </div >
    );
}
