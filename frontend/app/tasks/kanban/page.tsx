'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import KanbanBoard from '@/components/KanbanBoard';
import { useTasks } from '@/hooks/use-tasks';

export default function KanbanPage() {
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
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <Link href="/tasks" className="text-blue-600 text-sm block mb-1">← Back to Tasks</Link>
                        <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
                    </div>
                    <Link href="/tasks/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Create Task</Link>
                </div>
            </header>
            <main className="max-w-full mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
                            <option value="">All Projects</option>
                            {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                        </select>
                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
                            <option value="">All Priorities</option>
                            <option value="1">High</option>
                            <option value="2">Medium</option>
                            <option value="3">Low</option>
                        </select>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <KanbanBoard tasks={filtered} onTaskMove={handleTaskMove} />
                )}
            </main>
        </Sidebar>
    );
}
