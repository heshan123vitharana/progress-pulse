'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useEmployees } from '@/hooks/use-employees';
import api from '@/lib/api';

export default function PerformanceOverview() {
    const { data: session } = useSession();
    const { employees } = useEmployees();

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('month');
    const [stats, setStats] = useState({
        completion_rate: 0,
        productivity: 0,
        on_time_delivery: 0
    });
    const [loading, setLoading] = useState(true);

    const isAdmin = session?.user?.role_slug === 'admin';

    // Initialize filter for non-admins
    useEffect(() => {
        if (session?.user?.employee_id && !isAdmin) {
            setSelectedEmployeeId(String(session.user.employee_id));
        }
    }, [session, isAdmin]);

    useEffect(() => {
        const fetchPerformanceParams = async () => {
            setLoading(true);
            try {
                let queryParams = new URLSearchParams();

                if (selectedEmployeeId) {
                    queryParams.append('employee_id', selectedEmployeeId);
                }

                // Calculate Date Range
                const now = new Date();
                let start = new Date();
                let end = new Date();

                if (timeFilter === 'today') {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                } else if (timeFilter === 'week') {
                    // Start of week (Monday) - Fix: Handle Sunday (0) correctly
                    const day = now.getDay() || 7;
                    if (day !== 1) {
                        start.setDate(now.getDate() - (day - 1));
                    }
                    start.setHours(0, 0, 0, 0);
                } else if (timeFilter === 'month') {
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                }

                queryParams.append('start_date', start.toISOString());
                queryParams.append('end_date', end.toISOString());

                const response = await api.get<any>(`/dashboard/counts?${queryParams.toString()}`);

                if (response.data?.performance) {
                    setStats(response.data.performance);
                }
            } catch (error) {
                console.error('Failed to fetch performance stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceParams();
    }, [selectedEmployeeId, timeFilter]);

    const metrics = [
        { label: 'Task Completion Rate', value: stats.completion_rate, color: 'from-cyan-500 to-blue-500' },
        { label: 'Team Productivity', value: stats.productivity, color: 'from-emerald-500 to-teal-500' }, // Label kept as "Team Productivity" but it represents individual if filtered
        { label: 'On-Time Delivery', value: stats.on_time_delivery, color: 'from-amber-500 to-orange-500' }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
            <div className="flex flex-col gap-4 mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <span className="w-1 h-6 bg-cyan-500 rounded-full mr-3"></span>
                    Performance Overview
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Time Filter Toggle */}
                    <div className="bg-slate-100 p-1 rounded-lg flex shrink-0 self-start sm:self-auto">
                        {(['today', 'week', 'month'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${timeFilter === filter
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'This Month'}
                            </button>
                        ))}
                    </div>

                    {isAdmin && (
                        <div className="relative sm:ml-auto">
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="appearance-none pl-2 pr-1 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all cursor-pointer hover:border-slate-300 h-[28px]"
                            >
                                <option value="">All Employees</option>
                                {employees.map((emp) => (
                                    <option key={emp.employee_id} value={emp.employee_id}>
                                        {emp.first_name} {emp.last_name}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6 flex-1">
                {loading ? (
                    // Clean Skeleton Loading
                    [1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2 animate-pulse">
                            <div className="flex justify-between items-end">
                                <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                <div className="h-4 w-8 bg-slate-100 rounded"></div>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full"></div>
                        </div>
                    ))
                ) : (
                    metrics.map((item, i) => (
                        <div key={i} className="group">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium text-slate-600">{item.label}</span>
                                <span className="text-sm font-bold text-slate-800">{item.value}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${item.color}`}
                                    style={{ width: `${item.value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
