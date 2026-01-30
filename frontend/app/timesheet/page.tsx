'use client';
import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { LoadingSpinner } from '@/components/shared';
import { useTimeTracking } from '@/hooks/use-time-tracking';
import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { TimeEntry } from '@/types';
import api from '@/lib/api';
import { showSuccess, showError } from '@/lib/error-utils';

// Helper to check valid date
const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

interface GroupedEntry {
    id: string; // Composite ID
    date: string;
    task?: { task_id: number; task_name: string; task_code?: string };
    project?: { project_id: number; project_name: string; project_code?: string };
    description: string;
    totalDuration: number;
    isBillable: boolean;
    entries: TimeEntry[];
    isRunning: boolean;
    activeEntryStartTime?: string | Date;
}

export default function TimesheetPage() {
    const { timeEntries, loading, createTimeEntry, deleteTimeEntry, activeTimer, stopTimer, startTimer, refetch: refetchTime } = useTimeTracking();
    const { tasks } = useTasks();
    const { projects } = useProjects();
    const [showForm, setShowForm] = useState(false);

    // UI States
    const [loadingAction, setLoadingAction] = useState(false);
    const [completingGroup, setCompletingGroup] = useState<GroupedEntry | null>(null);

    // Grouping Logic
    const groupedEntries = useMemo(() => {
        const groups: Record<string, GroupedEntry> = {};

        timeEntries.forEach(entry => {
            const dateObj = new Date(entry.start_time);
            const dateKey = isValidDate(dateObj) ? dateObj.toISOString().split('T')[0] : 'unknown';

            // Group Key: Date + (TaskID OR ProjectID)
            const entityKey = entry.task_id ? `task_${entry.task_id}` : (entry.project_id ? `proj_${entry.project_id}` : 'general');
            const key = `${dateKey}_${entityKey}`;

            if (!groups[key]) {
                groups[key] = {
                    id: key,
                    date: dateKey,
                    task: entry.task,
                    project: entry.project,
                    description: entry.description || '',
                    totalDuration: 0,
                    isBillable: entry.is_billable,
                    entries: [],
                    isRunning: false
                };
            }

            // Accumulate
            const duration = entry.duration || 0;
            groups[key].totalDuration += duration;
            groups[key].entries.push(entry);

            // Check if this specific entry is the active one
            if (activeTimer?.id === entry.id || (entry.status === 'running')) {
                groups[key].isRunning = true;
                groups[key].activeEntryStartTime = entry.start_time;
            }
        });

        // Convert to array and sort by date desc
        return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
    }, [timeEntries, activeTimer]);

    // Active Task Group for Hero Section
    const activeGroup = useMemo(() => groupedEntries.find(g => g.isRunning), [groupedEntries]);

    const getCurrentLocalISOString = () => {
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60 * 1000;
        const localNow = new Date(now.getTime() - offsetMs);
        return localNow.toISOString().slice(0, 16);
    };

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
        const now = new Date();
        const start = new Date(formData.start_time);
        const end = formData.end_time ? new Date(formData.end_time) : null;

        if (start > now) { alert("Start time cannot be in the future"); return; }
        if (end && end > now) { alert("End time cannot be in the future"); return; }

        const result = await createTimeEntry({
            task_id: formData.task_id ? parseInt(formData.task_id) : undefined,
            project_id: formData.project_id ? parseInt(formData.project_id) : undefined,
            description: formData.description || undefined,
            start_time: formData.start_time || undefined,
            end_time: formData.end_time || undefined,
            is_billable: formData.is_billable,
        });
        if (result.success) {
            setShowForm(false);
            setFormData({ task_id: '', project_id: '', description: '', start_time: '', end_time: '', is_billable: true });
        }
    };

    const handleDeleteGroup = async (group: GroupedEntry) => {
        if (!confirm(`Are you sure you want to delete ${group.entries.length} entrie(s)?`)) return;
        for (const entry of group.entries) {
            await deleteTimeEntry(entry.id);
        }
    };

    // --- Actions ---

    const handleStartGroup = async (group: GroupedEntry) => {
        if (loadingAction) return;
        setLoadingAction(true);
        try {
            // Ensure numeric IDs for Zod validation
            const taskId = group.task?.task_id ? Number(group.task.task_id) : undefined;
            const projectId = group.project?.project_id ? Number(group.project.project_id) : undefined;

            await startTimer(taskId, projectId, group.description);
            await refetchTime();
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAction(false);
        }
    };

    const handlePauseGroup = async () => {
        if (loadingAction) return;
        setLoadingAction(true);
        try {
            await stopTimer();
            await refetchTime();
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleCompleteClick = (group: GroupedEntry) => {
        if (!group.task) return;
        setCompletingGroup(group);
    };

    const confirmComplete = async (statusChoice: 'qa' | 'test' | 'complete') => {
        if (!completingGroup || !completingGroup.task) return;

        setLoadingAction(true);
        try {
            if (completingGroup.isRunning) {
                await stopTimer();
            }
            // Map choices to new status codes
            const newStatus = statusChoice === 'qa' ? '4' : statusChoice === 'test' ? '7' : '8';
            await api.put(`/tasks/${completingGroup.task.task_id}`, { status: newStatus });

            const statusLabel = statusChoice === 'qa' ? 'In-QA' : statusChoice === 'test' ? 'In-Test Server' : 'Completed';
            showSuccess(`Task marked as ${statusLabel}`);
            setCompletingGroup(null);
            await refetchTime();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to update task status');
        } finally {
            setLoadingAction(false);
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds || isNaN(seconds) || seconds < 0) return '0h 0m';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    // Calculate stats for dashboard cards
    const todayEntries = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return timeEntries.filter(entry => {
            if (!entry.start_time) return false;
            const entryDate = new Date(entry.start_time);
            if (!isValidDate(entryDate)) return false;
            return entryDate.toISOString().split('T')[0] === today;
        });
    }, [timeEntries]);

    const stats = useMemo(() => {
        const totalSeconds = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        const completedTasks = new Set(todayEntries.filter(e => e.task_id).map(e => e.task_id)).size;
        const billableSeconds = todayEntries.filter(e => e.is_billable).reduce((sum, e) => sum + (e.duration || 0), 0);

        return {
            totalHours: (totalSeconds / 3600).toFixed(1),
            activeTimer: activeTimer ? 'Running' : 'Stopped',
            completedTasks,
            billableHours: (billableSeconds / 3600).toFixed(1)
        };
    }, [todayEntries, activeTimer]);

    const statCards = [
        {
            name: 'Total Hours Today',
            value: `${stats.totalHours}h`,
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-500/10 to-cyan-500/10',
            iconBg: 'bg-blue-500/20',
            textColor: 'text-blue-600'
        },
        {
            name: 'Active Timer',
            value: stats.activeTimer,
            icon: stats.activeTimer === 'Running' ? 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z',
            gradient: stats.activeTimer === 'Running' ? 'from-amber-500 to-orange-500' : 'from-slate-400 to-slate-500',
            bgGradient: stats.activeTimer === 'Running' ? 'from-amber-500/10 to-orange-500/10' : 'from-slate-400/10 to-slate-500/10',
            iconBg: stats.activeTimer === 'Running' ? 'bg-amber-500/20' : 'bg-slate-400/20',
            textColor: stats.activeTimer === 'Running' ? 'text-amber-600' : 'text-slate-600'
        },
        {
            name: 'Completed Tasks',
            value: stats.completedTasks,
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            gradient: 'from-emerald-500 to-teal-500',
            bgGradient: 'from-emerald-500/10 to-teal-500/10',
            iconBg: 'bg-emerald-500/20',
            textColor: 'text-emerald-600'
        },
        {
            name: 'Billable Hours',
            value: `${stats.billableHours}h`,
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            gradient: 'from-violet-500 to-purple-500',
            bgGradient: 'from-violet-500/10 to-purple-500/10',
            iconBg: 'bg-violet-500/20',
            textColor: 'text-violet-600'
        }
    ];

    return (
        <Sidebar>
            <div className="p-6 lg:p-8">
                {/* Dashboard-style Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Timesheet</h1>
                                <p className="text-slate-500 mt-0.5">Track your time and manage tasks</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Dashboard Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {statCards.map((stat, index) => (
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

                {/* --- HERO SECTION: Active Work --- */}
                {activeGroup ? (
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 shadow-2xl text-white">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-4 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                                    Currently Working On
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
                                    {activeGroup.task?.task_name || activeGroup.project?.project_name || 'Untitled Task'}
                                </h1>
                                <p className="text-slate-400 text-lg flex items-center justify-center md:justify-start gap-2">
                                    <span className="opacity-70">{activeGroup.task?.task_code || activeGroup.project?.project_code || '#UNK'}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                    {activeGroup.description || 'No description provided'}
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="text-6xl lg:text-7xl font-mono font-bold tracking-tighter tabular-nums bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                    <LiveDuration startTime={activeGroup.activeEntryStartTime!} baseDuration={activeGroup.totalDuration} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handlePauseGroup}
                                        disabled={loadingAction}
                                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl backdrop-blur-sm transition-all text-white font-medium group"
                                    >
                                        <svg className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                        Pause Timer
                                    </button>
                                    {activeGroup.task && (
                                        <button
                                            onClick={() => handleCompleteClick(activeGroup)}
                                            disabled={loadingAction}
                                            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/20 rounded-xl transition-all text-white font-medium"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            Complete Task
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Manual Form Toggle */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* ... Reusing existing form logic ... */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800">New Manual Entry</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* ... Fields ...  */}
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Task (Optional)</label>
                                    <select
                                        value={formData.task_id}
                                        onChange={e => setFormData({ ...formData, task_id: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
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
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Time *</label>
                                        <input required type="datetime-local" value={formData.start_time} max={getCurrentLocalISOString()} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">End Time *</label>
                                        <input required type="datetime-local" value={formData.end_time} max={getCurrentLocalISOString()} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" rows={2} />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors">Save Entry</button>
                            </div>
                        </form>
                    </div>
                )
                }

                {/* --- ACTIVITY LIST --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">Today's Activity</h2>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{groupedEntries.length} Tasks</span>
                    </div>

                    {loading ? (
                        <div className="p-12"><LoadingSpinner /></div>
                    ) : groupedEntries.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No activity yet today. Pick a task to get started!</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4 text-left">Task Details</th>
                                        <th className="px-6 py-4 text-left">Duration</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {groupedEntries.map((group) => (
                                        <tr key={group.id} className={`group transition-all hover:bg-slate-50/50 ${group.isRunning ? 'bg-violet-50/30' : ''}`}>
                                            <td className="px-8 py-5">
                                                <div className="flex items-start gap-4">
                                                    <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${group.isRunning ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {group.task ? (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-semibold text-base ${group.isRunning ? 'text-violet-700' : 'text-slate-800'}`}>
                                                            {group.task?.task_name || group.project?.project_name || 'Untitled'}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{group.task?.task_code || '---'}</span>
                                                            <span>•</span>
                                                            <span className="line-clamp-1">{group.description}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-base font-mono font-medium ${group.isRunning ? 'text-violet-600' : 'text-slate-700'}`}>
                                                    {group.isRunning && group.activeEntryStartTime ? (
                                                        <LiveDuration startTime={group.activeEntryStartTime} baseDuration={group.totalDuration} />
                                                    ) : (
                                                        formatDuration(group.totalDuration)
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                {group.isRunning ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wide">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                                        </span>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wide">
                                                        Paused
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!group.isRunning && (
                                                        <button
                                                            onClick={() => handleStartGroup(group)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip"
                                                            title="Resume this task"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                        </button>
                                                    )}

                                                    {group.task && (
                                                        <button
                                                            onClick={() => handleCompleteClick(group)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Complete Task"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDeleteGroup(group)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Delete Entries"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* QA Confirmation Modal */}
                {
                    completingGroup && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-white/50">
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Task Completed!</h3>
                                    <p className="text-slate-500 mb-8">
                                        Great work on <strong>{completingGroup.task?.task_name}</strong>.<br />
                                        What would you like to do next?
                                    </p>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => confirmComplete('qa')}
                                            disabled={loadingAction}
                                            className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                            Submit for QA Review
                                        </button>

                                        <button
                                            onClick={() => confirmComplete('test')}
                                            disabled={loadingAction}
                                            className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-200 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            Deploy to Test Server
                                        </button>

                                        <button
                                            onClick={() => confirmComplete('complete')}
                                            disabled={loadingAction}
                                            className="w-full py-3.5 px-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            Mark as Completed
                                        </button>

                                        <button
                                            onClick={() => setCompletingGroup(null)}
                                            disabled={loadingAction}
                                            className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </Sidebar >
    );
}

function LiveDuration({ startTime, baseDuration = 0 }: { startTime: string | Date, baseDuration?: number }) {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const start = new Date(startTime).getTime();

        const update = () => {
            const now = new Date().getTime();
            const activeSeconds = Math.floor((now - start) / 1000);
            setDuration(baseDuration + activeSeconds);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startTime, baseDuration]);

    const h = Math.floor(duration / 3600);
    const m = Math.floor((duration % 3600) / 60);
    const s = duration % 60;

    return (
        <span className="font-mono tabular-nums">
            {h}h {m}m {s}s
        </span>
    );
}
