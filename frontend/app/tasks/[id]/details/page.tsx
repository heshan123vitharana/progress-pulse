'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Task } from '@/types';
import { useTimeTracking } from '@/hooks/use-time-tracking';
import { showSuccess, showError } from '@/lib/error-utils';

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

// Helper function for safe date parsing
function safeDate(date: any): string {
    if (!date) return '-';
    try {
        const d = new Date(date);
        return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
    } catch {
        return '-';
    }
}

export default function TaskDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params?.id ? parseInt(params.id as string) : null;

    const [task, setTask] = useState<Task & { currentUserAssignment?: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const { activeTimer, startTimer, stopTimer } = useTimeTracking();

    useEffect(() => {
        if (taskId) {
            fetchTaskDetails();
        }
    }, [taskId]);

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tasks/${taskId}`);
            setTask(response.data.data || response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch task details');
        } finally {
            setLoading(false);
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

    const handlePickUp = async () => {
        if (!taskId) return;
        try {
            await api.post(`/tasks/${taskId}/status`, { status: 'picked_up' });
            showSuccess('Task picked up');
            await fetchTaskDetails();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to pick up task');
        }
    };


    const isAssignedToMe = task?.currentUserAssignment !== undefined;
    const isPendingAcceptance = task?.currentUserAssignment?.acceptance_status === 'pending';
    const isAccepted = task?.currentUserAssignment?.acceptance_status === 'accepted';
    const isTimerRunningForThisTask =
        (activeTimer?.task?.task_id && String(activeTimer.task.task_id) === String(taskId)) ||
        (activeTimer?.task_id && String(activeTimer.task_id) === String(taskId));

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

    const statusObj = TASK_STATUSES.find(s => String(s.value) === String(task.status));
    const priorityObj = PRIORITY_LEVELS.find(p => String(p.value) === String(task.priority));

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/tasks" className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
                        ← Back to Tasks
                    </Link>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{task.task_name}</h1>
                                {isTimerRunningForThisTask && (
                                    <span className="animate-pulse inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        ● Recording Time
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Task Code: {task.task_code}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {isAssignedToMe && isPendingAcceptance && (
                                <button
                                    onClick={handlePickUp}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Pick Up Task
                                </button>
                            )}

                            <Link
                                href="/timesheet"
                                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Track Time in Timesheet
                            </Link>

                            <Link
                                href={`/tasks/${taskId}/edit`}
                                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition"
                            >
                                Edit
                            </Link>
                        </div>
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
                                    <p className="mt-1 text-gray-900">{task.description || task.task_description || 'No description provided'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Project</label>
                                        <p className="mt-1 text-gray-900">{task.project?.project_name || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Assigned To</label>
                                        <p className="mt-1 text-gray-900">
                                            {task.employee
                                                ? `${task.employee.first_name} ${task.employee.last_name}`
                                                : (task.assigned_user?.name || 'Unassigned')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                                        <p className="mt-1 text-gray-900">
                                            {safeDate(task.start_date)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">End Date</label>
                                        <p className="mt-1 text-gray-900">
                                            {safeDate(task.end_date)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Estimated Hours</label>
                                    <p className="mt-1 text-gray-900">
                                        {task.estimated_hours ? `${task.estimated_hours} hours` : 'Not specified'}
                                    </p>
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
                        {/* Status Card - Read Only */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
                            <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${statusObj?.color || 'bg-gray-100 text-gray-800'}`}>
                                {statusObj?.label || 'Unknown'}
                            </span>
                        </div>

                        {/* Priority Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Priority</h3>
                            {priorityObj ? (
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${priorityObj.color}`}>
                                    {priorityObj.label}
                                </span>
                            ) : (
                                <span className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
                                    Not Set
                                </span>
                            )}
                        </div>

                        {/* Metadata Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Information</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Created:</span>
                                    <p className="text-gray-900">{safeDate(task.created_at)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Last Updated:</span>
                                    <p className="text-gray-900">{safeDate(task.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
