'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { LoadingSpinner } from '@/components/shared';
import { useTimeTracking } from '@/hooks/use-time-tracking';
import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';

export default function TimesheetPage() {
    const { timeEntries, loading, createTimeEntry, deleteTimeEntry } = useTimeTracking();
    const { tasks } = useTasks();
    const { projects } = useProjects();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        task_id: '',
        project_id: '',
        description: '',
        start_time: '',
        end_time: '',
        is_billable: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createTimeEntry({
            task_id: formData.task_id ? parseInt(formData.task_id) : null,
            project_id: formData.project_id ? parseInt(formData.project_id) : null,
            description: formData.description || undefined,
            start_time: formData.start_time || undefined,
            end_time: formData.end_time || null,
            is_billable: formData.is_billable,
        });
        if (result.success) {
            setShowForm(false);
            setFormData({ task_id: '', project_id: '', description: '', start_time: '', end_time: '', is_billable: true });
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '-';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600;
    const billableHours = timeEntries.filter(e => e.is_billable).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600;
    const entriesThisWeek = timeEntries.length;

    return (
        <Sidebar>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Timesheet</h1>
                            <p className="text-slate-500 mt-0.5">Track your work hours and productivity</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02] transition-all duration-300"
                    >
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Time Entry
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800">New Time Entry</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Task (Optional)</label>
                                    <select
                                        value={formData.task_id}
                                        onChange={e => setFormData({ ...formData, task_id: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    >
                                        <option value="">No Task</option>
                                        {tasks.map(t => <option key={t.task_id} value={t.task_id}>{t.task_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Project (Optional)</label>
                                    <select
                                        value={formData.project_id}
                                        onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Time *</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={formData.start_time}
                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">End Time *</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={formData.end_time}
                                        onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                                    rows={3}
                                    placeholder="What did you work on?"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_billable}
                                        onChange={e => setFormData({ ...formData, is_billable: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-purple-600"></div>
                                </label>
                                <span className="text-sm font-medium text-slate-700">Billable</span>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
                                >
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white/50 group cursor-pointer">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500"></div>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Hours</p>
                                <p className="text-4xl font-bold mt-2 text-violet-600">{totalHours.toFixed(1)}h</p>
                            </div>
                            <div className="p-3 rounded-xl bg-violet-500/20 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    </div>

                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white/50 group cursor-pointer">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Billable Hours</p>
                                <p className="text-4xl font-bold mt-2 text-emerald-600">{billableHours.toFixed(1)}h</p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/20 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    </div>

                    <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white/50 group cursor-pointer">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Entries</p>
                                <p className="text-4xl font-bold mt-2 text-amber-600">{entriesThisWeek}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/20 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    </div>
                </div>

                {/* Time Entries Table */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200/50">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Time Entries
                        </h2>
                    </div>
                    {loading ? (
                        <div className="p-12">
                            <LoadingSpinner />
                        </div>
                    ) : timeEntries.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-700 mb-1">No time entries yet</h3>
                            <p className="text-slate-500">Start tracking your time by adding a new entry</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Task/Project</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Billable</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {timeEntries.map((entry, index) => (
                                        <tr
                                            key={entry.id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-violet-600">
                                                            {new Date(entry.start_time).getDate()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">
                                                            {new Date(entry.start_time).toLocaleDateString('en-US', { weekday: 'short' })}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {new Date(entry.start_time).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-sm font-medium text-slate-700">
                                                    {entry.task?.task_name || entry.project?.project_name || 'No task/project'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600 max-w-xs truncate">
                                                    {entry.description || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                                                    <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {formatDuration(entry.duration)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${entry.is_billable
                                                    ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                    }`}>
                                                    {entry.is_billable ? (
                                                        <>
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Yes
                                                        </>
                                                    ) : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => deleteTimeEntry(entry.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Sidebar>
    );
}
