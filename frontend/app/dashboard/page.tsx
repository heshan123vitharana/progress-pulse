'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/auth-store';
import { useDashboard } from '@/hooks/use-dashboard';
import { useEmployees } from '@/hooks/use-employees';
import StatusToggle from '@/components/dashboard/StatusToggle';
import PerformanceOverview from '@/components/dashboard/PerformanceOverview';

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const { counts, loading } = useDashboard();
    const { employees } = useEmployees();

    const currentEmployee = useMemo(() => {
        if (!user?.employee_id || !employees.length) return null;
        return employees.find(e => e.employee_id === user.employee_id);
    }, [user, employees]);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    const stats = [
        {
            name: 'Total Tasks',
            value: counts?.total_tasks || 0,
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-500/10 to-cyan-500/10',
            iconBg: 'bg-blue-500/20',
            textColor: 'text-blue-600'
        },
        {
            name: 'Active Tasks',
            value: counts?.active_tasks || 0,
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            iconBg: 'bg-amber-500/20',
            textColor: 'text-amber-600'
        },
        {
            name: 'Completed',
            value: counts?.completed_tasks || 0,
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            gradient: 'from-emerald-500 to-teal-500',
            bgGradient: 'from-emerald-500/10 to-teal-500/10',
            iconBg: 'bg-emerald-500/20',
            textColor: 'text-emerald-600'
        },
        {
            name: 'High Priority',
            value: counts?.high_priority_tasks || 0,
            icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
            gradient: 'from-rose-500 to-pink-500',
            bgGradient: 'from-rose-500/10 to-pink-500/10',
            iconBg: 'bg-rose-500/20',
            textColor: 'text-rose-600'
        }
    ];

    const quickActions = [
        { name: 'New Task', href: '/tasks/create', icon: 'M12 4v16m8-8H4', color: 'from-blue-500 to-cyan-500' },
        ...(user?.role_slug === 'admin' ? [{ name: 'New Employee', href: '/employees/create', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', color: 'from-violet-500 to-purple-500' }] : []),
        { name: 'Analytics', href: '/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'from-emerald-500 to-teal-500' },
        { name: 'Reports', href: '/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-amber-500 to-orange-500' }
    ];

    return (
        <Sidebar>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Dashboard</h1>
                                <p className="text-slate-500 mt-0.5">Welcome back, <span className="text-cyan-600 font-medium">{user?.name}</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start lg:items-end gap-4">
                        {currentEmployee && (
                            <StatusToggle
                                employeeId={currentEmployee.employee_id}
                                initialStatus={currentEmployee.status}
                            />
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 animate-pulse border border-slate-200/50">
                                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.name}
                                className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white/50 group cursor-pointer`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Decorative gradient border */}
                                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.gradient}`}></div>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                                        <p className={`text-4xl font-bold mt-2 ${stat.textColor}`}>
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                                        <svg className={`w-7 h-7 ${stat.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                        </svg>
                                    </div>
                                </div>

                                {/* Decorative circle */}
                                <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-slate-200/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Quick Actions
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <a
                                key={action.name}
                                href={action.href}
                                className="group relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-xl bg-slate-50 hover:bg-white border-2 border-dashed border-slate-200 hover:border-transparent hover:shadow-lg transition-all duration-300"
                            >
                                {/* Hover gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

                                <div className={`relative p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg mb-3 group-hover:scale-110 group-hover:shadow-xl transition-all`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{action.name}</span>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-slate-200/50">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recent Activity
                        </h3>
                        {/* ... existing recent activity content ... */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                        {['T', 'E', 'P'][i]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700">{['New task created', 'Employee updated', 'Project completed'][i]}</p>
                                        <p className="text-xs text-slate-400">{['2 minutes ago', '1 hour ago', 'Yesterday'][i]}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Integrated Performance Overview Component */}
                    <PerformanceOverview />
                </div>
            </div>
        </Sidebar>
    );
}
