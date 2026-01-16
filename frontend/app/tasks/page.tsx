'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { PageHeader, LoadingSpinner, EmptyState, StatusBadge } from '@/components/shared';
import { TASK_STATUSES, PRIORITY_LEVELS } from '@/lib/constants';
import { useTasks } from '@/hooks/use-tasks';

export default function TasksPage() {
    const { tasks, projects, loading, deleteTask } = useTasks();
    const [activeTab, setActiveTab] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterProject, setFilterProject] = useState('');

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.task_name.toLowerCase().includes(searchTerm.toLowerCase()) || t.task_code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !activeTab || t.status === activeTab;
        const matchesPriority = !filterPriority || t.priority.toString() === filterPriority;
        const matchesProject = !filterProject || t.project_id.toString() === filterProject;
        return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Delete task "${name}"?`)) {
            const result = await deleteTask(id);
            if (!result.success) alert(result.error);
        }
    };

    return (
        <Sidebar>
            <PageHeader title="Task Management" backHref="/dashboard" action={<Link href="/tasks/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Create Task</Link>} />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    <button onClick={() => setActiveTab('')} className={`px-4 py-2 rounded-lg whitespace-nowrap ${!activeTab ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'}`}>All</button>
                    {TASK_STATUSES.map(s => (
                        <button key={s.value} onClick={() => setActiveTab(s.value)} className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === s.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'}`}>{s.label}</button>
                    ))}
                </div>
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid md:grid-cols-4 gap-4">
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white placeholder-gray-500" />
                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
                            <option value="">All Priorities</option>
                            {PRIORITY_LEVELS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
                            <option value="">All Projects</option>
                            {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? <LoadingSpinner /> : filteredTasks.length === 0 ? <EmptyState message="No tasks found" /> : (
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredTasks.map(t => {
                                    const priority = PRIORITY_LEVELS.find(p => p.value === t.priority);
                                    const status = TASK_STATUSES.find(s => s.value === t.status);
                                    return (
                                        <tr key={t.task_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium">{t.task_code}</td>
                                            <td className="px-6 py-4 text-sm">{t.task_name}</td>
                                            <td className="px-6 py-4 text-sm">{t.project?.project_name || '-'}</td>
                                            <td className="px-6 py-4"><StatusBadge status={priority?.label || ''} colorClass={priority?.color} /></td>
                                            <td className="px-6 py-4"><StatusBadge status={status?.label || ''} colorClass={status?.color} /></td>
                                            <td className="px-6 py-4 text-sm space-x-2">
                                                <Link href={`/tasks/${t.task_id}/details`} className="text-blue-600">View</Link>
                                                <Link href={`/tasks/${t.task_id}/edit`} className="text-blue-600">Edit</Link>
                                                <button onClick={() => handleDelete(t.task_id, t.task_name)} className="text-red-600">Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </Sidebar>
    );
}
