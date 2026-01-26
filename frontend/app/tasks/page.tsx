'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { TASK_STATUSES, PRIORITY_LEVELS } from '@/lib/constants';
import { useTasks } from '@/hooks/use-tasks';

export default function TasksPage() {
    const { tasks, projects, loading, deleteTask } = useTasks();
    const [activeTab, setActiveTab] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterProject, setFilterProject] = useState('');

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = (t.task_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.task_code || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !activeTab || t.status === activeTab;
        const matchesPriority = !filterPriority || (t.priority?.toString() === filterPriority);
        const matchesProject = !filterProject || (t.project_id?.toString() === filterProject);
        return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Delete task "${name}"?`)) {
            const result = await deleteTask(id);
            if (!result.success) alert(result.error);
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'critical': case '1': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'high': case '2': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': case '3': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': case '4': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case '1': return 'bg-slate-100 text-slate-700 border-slate-200';
            case '2': return 'bg-blue-100 text-blue-700 border-blue-200';
            case '3': return 'bg-amber-100 text-amber-700 border-amber-200';
            case '4': return 'bg-violet-100 text-violet-700 border-violet-200';
            case '5': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case '6': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <Sidebar>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Tasks</h1>
                            <p className="text-slate-500 text-sm">{filteredTasks.length} of {tasks.length} tasks</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/tasks/kanban"
                            className="inline-flex items-center px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-white hover:shadow-lg transition-all"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                            </svg>
                            Kanban
                        </Link>
                        <Link
                            href="/tasks/create"
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Task
                        </Link>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('')}
                        className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${!activeTab
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white hover:shadow-md border border-slate-200/50'
                            }`}
                    >
                        All Tasks
                    </button>
                    {TASK_STATUSES.map(s => (
                        <button
                            key={s.value}
                            onClick={() => setActiveTab(s.value)}
                            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === s.value
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                                : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white hover:shadow-md border border-slate-200/50'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 mb-6 border border-slate-200/50">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <select
                            value={filterPriority}
                            onChange={e => setFilterPriority(e.target.value)}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        >
                            <option value="">All Priorities</option>
                            {PRIORITY_LEVELS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        <select
                            value={filterProject}
                            onChange={e => setFilterProject(e.target.value)}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        >
                            <option value="">All Projects</option>
                            {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-500 font-medium">Loading tasks...</p>
                            </div>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No tasks found</h3>
                            <p className="text-slate-500 mb-6">Create your first task to get started</p>
                            <Link
                                href="/tasks/create"
                                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 transition-all"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Task
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Project</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Priority</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTasks.map(t => {
                                        const priority = PRIORITY_LEVELS.find(p => p.value.toString() === t.priority?.toString());
                                        const status = TASK_STATUSES.find(s => s.value.toString() === t.status?.toString());
                                        const isOverdue = t.end_date && new Date(t.end_date) < new Date() && !['5', '6'].includes(t.status?.toString());

                                        return (
                                            <tr key={t.task_id} className={`hover:bg-slate-50/50 transition-colors ${isOverdue ? 'bg-rose-50/50' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">{t.task_code}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{t.task_name}</p>
                                                        {isOverdue && (
                                                            <p className="text-xs text-rose-500 mt-0.5 flex items-center">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Overdue
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{t.project?.project_name || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getPriorityStyle(t.priority?.toString() || '')}`}>
                                                        {priority?.label || t.priority || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(t.status?.toString() || '')}`}>
                                                        {status?.label || t.status || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={`/tasks/${t.task_id}/details`}
                                                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                                                            title="View"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>
                                                        <Link
                                                            href={`/tasks/${t.task_id}/edit`}
                                                            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(t.task_id, t.task_name)}
                                                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Sidebar>
    );
}
