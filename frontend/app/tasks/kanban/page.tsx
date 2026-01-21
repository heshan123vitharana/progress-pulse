'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import KanbanBoard from '@/components/KanbanBoard';
import { useTasks } from '@/hooks/use-tasks';
import { PRIORITY_LEVELS } from '@/lib/constants';

export default function KanbanPage() {
    const router = useRouter();
    const { tasks, projects, loading, updateTask } = useTasks();
    const [filterProject, setFilterProject] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    const filtered = tasks.filter(t => {
        const matchesProject = !filterProject || t.project_id?.toString() === filterProject;
        const matchesPriority = !filterPriority || t.priority.toString() === filterPriority;
        return matchesProject && matchesPriority;
    });

    const handleTaskMove = async (taskId: number, newStatus: string) => {
        const task = tasks.find(t => t.task_id === taskId);
        if (task) {
            await updateTask(taskId, { ...task, status: newStatus });
        }
    };

    return (
        <Sidebar>
            <div className="p-6 lg:p-8 min-h-screen">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/50 text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-lg transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Kanban Board</h1>
                                <p className="text-slate-500 text-sm">{filtered.length} tasks</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/tasks"
                            className="inline-flex items-center px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-white hover:shadow-lg transition-all"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            List View
                        </Link>
                        <Link
                            href="/tasks/create"
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Task
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 mb-6 border border-slate-200/50">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Filter:</span>
                        </div>
                        <select
                            value={filterProject}
                            onChange={e => setFilterProject(e.target.value)}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all min-w-[180px]"
                        >
                            <option value="">All Projects</option>
                            {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                        </select>
                        <select
                            value={filterPriority}
                            onChange={e => setFilterPriority(e.target.value)}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all min-w-[150px]"
                        >
                            <option value="">All Priorities</option>
                            {PRIORITY_LEVELS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        {(filterProject || filterPriority) && (
                            <button
                                onClick={() => { setFilterProject(''); setFilterPriority(''); }}
                                className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Kanban Board */}
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-medium">Loading tasks...</p>
                        </div>
                    </div>
                ) : (
                    <KanbanBoard tasks={filtered} onTaskMove={handleTaskMove} />
                )}
            </div>
        </Sidebar>
    );
}
