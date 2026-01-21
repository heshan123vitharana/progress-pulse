'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Task } from '@/types';

const TASK_STATUSES = [
    { value: '1', label: 'Created', color: 'bg-blue-100 text-blue-800' },
    { value: '2', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: '3', label: 'QA', color: 'bg-purple-100 text-purple-800' },
    { value: '4', label: 'Repeat', color: 'bg-orange-100 text-orange-800' },
    { value: '5', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: '6', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

const PRIORITY_LEVELS = [
    { value: 1, label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 2, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 3, label: 'Low', color: 'bg-green-100 text-green-800' },
];

export default function TaskDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params?.id ? parseInt(params.id as string) : null;

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        if (taskId) {
            fetchTaskDetails();
        }
    }, [taskId]);

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tasks/${taskId}`);
            setTask(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch task details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!taskId) return;

        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            await fetchTaskDetails();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !taskId) return;

        setSubmittingComment(true);
        try {
            await api.post('/task-comments', {
                task_id: taskId,
                comment: newComment,
            });
            setNewComment('');
            await fetchTaskDetails();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading task details...</p>
                </div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">{error || 'Task not found'}</p>
                    <Link href="/tasks" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                        ← Back to Tasks
                    </Link>
                </div>
            </div>
        );
    }

    const statusObj = TASK_STATUSES.find(s => s.value === task.status);
    const priorityObj = PRIORITY_LEVELS.find(p => p.value === task.priority);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/tasks" className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
                        ← Back to Tasks
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{task.task_name}</h1>
                            <p className="text-sm text-gray-500 mt-1">Task Code: {task.task_code}</p>
                        </div>
                        <Link
                            href={`/tasks/${taskId}/edit`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                            Edit Task
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Task Details Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="mt-1 text-gray-900">{task.task_description || 'No description provided'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Project</label>
                                        <p className="mt-1 text-gray-900">{task.project?.project_name || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Assigned To</label>
                                        <p className="mt-1 text-gray-900">{task.employee ? `${task.employee.first_name} ${task.employee.last_name}` : 'Unassigned'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                                        <p className="mt-1 text-gray-900">
                                            {task.start_date ? new Date(task.start_date).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">End Date</label>
                                        <p className="mt-1 text-gray-900">
                                            {task.end_date ? new Date(task.end_date).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Estimated Hours</label>
                                    <p className="mt-1 text-gray-900">{task.estimated_hours || '-'} hours</p>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>

                            {/* Comment Form */}
                            <form onSubmit={handleCommentSubmit} className="mb-6">
                                <textarea
                                    rows={3}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submittingComment || !newComment.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                                    >
                                        {submittingComment ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-4">
                                <div className="text-center text-gray-500 py-8">
                                    <p>No comments yet. Be the first to comment!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {TASK_STATUSES.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                            <div className="mt-3">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusObj?.color}`}>
                                    {statusObj?.label}
                                </span>
                            </div>
                        </div>

                        {/* Priority Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Priority</h3>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${priorityObj?.color}`}>
                                {priorityObj?.label}
                            </span>
                        </div>

                        {/* Metadata Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Information</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Created:</span>
                                    <p className="text-gray-900">{new Date(task.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Last Updated:</span>
                                    <p className="text-gray-900">{new Date(task.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
