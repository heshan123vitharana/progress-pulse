'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { PageHeader, LoadingSpinner } from '@/components/shared';
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
            task_id: formData.task_id ? parseInt(formData.task_id) : undefined,
            project_id: formData.project_id ? parseInt(formData.project_id) : undefined,
            description: formData.description,
            start_time: formData.start_time,
            end_time: formData.end_time,
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

    return (
        <Sidebar>
            <PageHeader title="Timesheet" backHref="/dashboard" action={<button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add Time Entry</button>} />
            <main className="max-w-7xl mx-auto px-4 py-8">
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Task (Optional)</label>
                                <select value={formData.task_id} onChange={e => setFormData({ ...formData, task_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white">
                                    <option value="">No Task</option>
                                    {tasks.map(t => <option key={t.task_id} value={t.task_id}>{t.task_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Project (Optional)</label>
                                <select value={formData.project_id} onChange={e => setFormData({ ...formData, project_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white">
                                    <option value="">No Project</option>
                                    {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Start Time *</label>
                                <input required type="datetime-local" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">End Time *</label>
                                <input required type="datetime-local" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white" rows={3} />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.is_billable} onChange={e => setFormData({ ...formData, is_billable: e.target.checked })} className="w-4 h-4" />
                            <label className="text-sm font-medium">Billable</label>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border rounded-lg">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                        </div>
                    </form>
                )}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Total Hours This Week</p>
                        <p className="text-4xl font-bold text-blue-600">{totalHours.toFixed(2)}h</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? <LoadingSpinner /> : (
                        <table className="min-w-full relative">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Task/Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Billable</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {timeEntries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{new Date(entry.start_time).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm">{entry.task?.task_name || entry.project?.project_name || '-'}</td>
                                        <td className="px-6 py-4 text-sm">{entry.description || '-'}</td>
                                        <td className="px-6 py-4 text-sm font-medium">{formatDuration(entry.duration)}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded ${entry.is_billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{entry.is_billable ? 'Yes' : 'No'}</span></td>
                                        <td className="px-6 py-4 text-sm"><button onClick={() => deleteTimeEntry(entry.id)} className="text-red-600">Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </Sidebar>
    );
}
