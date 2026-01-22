'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface CustomerData {
    customer_id: string;
    customer_name: string;
    company: string;
    email: string;
    projects: { project_id: string; project_name: string }[];
}

interface CustomerTask {
    id: string;
    title: string;
    description: string;
    priority: number;
    status: string;
    project_name?: string;
    created_at: string;
}

export default function CustomerDashboard() {
    const router = useRouter();
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [tasks, setTasks] = useState<CustomerTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0
    });

    useEffect(() => {
        const token = localStorage.getItem('customer_token');
        const customerData = localStorage.getItem('customer_data');

        if (!token || !customerData) {
            router.push('/customer-portal/login');
            return;
        }

        setCustomer(JSON.parse(customerData));
        fetchTasks(token);
    }, [router]);

    const fetchTasks = async (token: string) => {
        try {
            const response = await api.get('/customer-portal/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setTasks(response.data.data.tasks || []);
                setStats(response.data.data.stats || stats);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_data');
        toast.success('Logged out successfully');
        router.push('/customer-portal/login');
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 3: return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 2: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/20 text-emerald-400';
            case 'in_progress': return 'bg-blue-500/20 text-blue-400';
            case 'pending': return 'bg-amber-500/20 text-amber-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (!customer) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-sm border-b border-emerald-500/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Customer Portal</h1>
                                <p className="text-xs text-emerald-400">{customer.company || customer.customer_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-emerald-200/70">{customer.email}</span>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-500/20 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome, {customer.customer_name || 'Customer'}!
                    </h2>
                    <p className="text-emerald-200/60">
                        Track your reported issues and submit new requests
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                        <p className="text-sm text-emerald-200/60 mb-1">Total Issues</p>
                        <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="bg-amber-500/10 backdrop-blur-sm rounded-2xl p-5 border border-amber-500/20">
                        <p className="text-sm text-amber-200/60 mb-1">Pending</p>
                        <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
                    </div>
                    <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/20">
                        <p className="text-sm text-blue-200/60 mb-1">In Progress</p>
                        <p className="text-3xl font-bold text-blue-400">{stats.in_progress}</p>
                    </div>
                    <div className="bg-emerald-500/10 backdrop-blur-sm rounded-2xl p-5 border border-emerald-500/20">
                        <p className="text-sm text-emerald-200/60 mb-1">Completed</p>
                        <p className="text-3xl font-bold text-emerald-400">{stats.completed}</p>
                    </div>
                </div>

                {/* Quick Action */}
                <Link
                    href="/customer-portal/report-issue"
                    className="block mb-8 p-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Report New Issue</h3>
                            <p className="text-sm text-emerald-200/60">Submit a bug report or feature request</p>
                        </div>
                    </div>
                </Link>

                {/* Recent Issues */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-5 border-b border-white/10">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Your Reported Issues
                        </h3>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-emerald-200/60 mt-4">Loading...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-medium text-white mb-1">No issues reported yet</h4>
                            <p className="text-emerald-200/60">Submit your first issue to get started</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {tasks.map((task) => (
                                <div key={task.id} className="p-5 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-white mb-1">{task.title}</h4>
                                            <p className="text-sm text-emerald-200/50 line-clamp-2">{task.description}</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getStatusColor(task.status)}`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(task.priority)}`}>
                                                    {task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
                                                </span>
                                                {task.project_name && (
                                                    <span className="text-xs text-emerald-200/40">{task.project_name}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-emerald-200/40">
                                            {new Date(task.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
