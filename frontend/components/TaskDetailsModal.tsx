'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Task } from '@/types';

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: number | null;
    onPickUp: (taskId: number) => Promise<void>;
    onReject: (taskId: number) => Promise<void>;
    loading?: boolean;
}

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

export default function TaskDetailsModal({
    isOpen,
    onClose,
    taskId,
    onPickUp,
    onReject,
    loading: actionLoading = false
}: TaskDetailsModalProps) {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && taskId) {
            fetchTaskDetails();
        }
    }, [isOpen, taskId]);

    const fetchTaskDetails = async () => {
        if (!taskId) return;

        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/tasks/${taskId}`);
            setTask(response.data.data || response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load task details');
        } finally {
            setLoading(false);
        }
    };

    const handlePickUp = () => {
        if (taskId) {
            onPickUp(taskId);
        }
    };

    const handleReject = () => {
        if (taskId) {
            onReject(taskId);
        }
    };

    if (!isOpen) return null;

    const statusObj = TASK_STATUSES.find(s => s.value === task?.status);
    const priorityObj = PRIORITY_LEVELS.find(p => p.value === task?.priority);

    const formatDate = (date: any) => {
        if (!date) return '-';
        try {
            const d = new Date(date);
            return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
        } catch {
            return '-';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 px-8 py-6 text-white overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-blue-700/20 rounded-full blur-2xl" />

                        <div className="relative flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-cyan-100">Task Details</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-1">
                                    {loading ? 'Loading...' : task?.task_name || 'Task'}
                                </h2>
                                {task?.task_code && (
                                    <p className="text-cyan-100 text-sm font-mono">{task.task_code}</p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-8 py-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        ) : task ? (
                            <div className="space-y-6">
                                {/* Status & Priority Badges */}
                                <div className="flex flex-wrap gap-3">
                                    {statusObj && (
                                        <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusObj.color}`}>
                                            {statusObj.label}
                                        </span>
                                    )}
                                    {priorityObj && (
                                        <span className={`px-4 py-2 text-sm font-semibold rounded-full ${priorityObj.color}`}>
                                            Priority: {priorityObj.label}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h3>
                                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                                        {task.description || task.task_description || 'No description provided'}
                                    </p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Project</h3>
                                        <p className="text-slate-800 dark:text-slate-200">
                                            {task.project?.project_name || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Assigned To</h3>
                                        <p className="text-slate-800 dark:text-slate-200">
                                            {task.employee
                                                ? `${task.employee.first_name} ${task.employee.last_name}`
                                                : (task.assigned_user?.name || 'Unassigned')}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Start Date</h3>
                                        <p className="text-slate-800 dark:text-slate-200">{formatDate(task.start_date)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">End Date</h3>
                                        <p className="text-slate-800 dark:text-slate-200">{formatDate(task.end_date)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Estimated Hours</h3>
                                        <p className="text-slate-800 dark:text-slate-200">{task.estimated_hours || '-'} hours</p>
                                    </div>
                                </div>

                                {/* Info Alert */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="text-sm text-blue-800 dark:text-blue-300">
                                            <p className="font-semibold mb-1">What happens next?</p>
                                            <p><strong>Pick Up:</strong> Accept this task and start tracking time in the timesheet.</p>
                                            <p><strong>Don't Pick Up:</strong> Decline this assignment and notify the task creator.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer Actions */}
                    {!loading && !error && task && (
                        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Don't Pick Up
                                </button>
                                <button
                                    onClick={handlePickUp}
                                    disabled={actionLoading}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {actionLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Pick Up Task
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
