'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PendingTask {
    task_id: number;
    task_name: string;
    description: string;
    task_priority: number;
    due_date: string;
    project?: { project_name: string };
    module?: { module_name: string };
    assignment?: {
        assignment_id: number;
        acceptance_status: string;
    };
}

export default function TaskAcceptancePanel() {
    const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingTasks();
    }, []);

    const fetchPendingTasks = async () => {
        try {
            // This would need a new endpoint to get pending tasks for current user
            // For now, we'll fetch all tasks and filter client-side
            const response = await api.get('/tasks');
            // Filter for pending tasks assigned to current user
            setPendingTasks(response.data.filter((task: any) =>
                task.assignment?.acceptance_status === 'pending'
            ));
        } catch (error) {
            console.error('Error fetching pending tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (taskId: number) => {
        try {
            await api.post(`/tasks/${taskId}/accept`);
            alert('Task accepted successfully!');
            fetchPendingTasks();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to accept task');
        }
    };

    const handleReject = async (taskId: number) => {
        if (confirm('Are you sure you want to reject this task?')) {
            try {
                await api.post(`/tasks/${taskId}/reject`);
                alert('Task rejected');
                fetchPendingTasks();
            } catch (error: any) {
                alert(error.response?.data?.message || 'Failed to reject task');
            }
        }
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 3: return 'bg-red-100 text-red-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 3: return 'High';
            case 2: return 'Medium';
            default: return 'Low';
        }
    };

    if (loading) {
        return <div>Loading pending tasks...</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Pending Task Assignments</h2>

            {pendingTasks.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    No pending task assignments
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingTasks.map((task) => (
                        <div key={task.task_id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{task.task_name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>

                                    <div className="flex gap-4 text-sm text-gray-500">
                                        {task.project && (
                                            <span>📁 {task.project.project_name}</span>
                                        )}
                                        {task.module && (
                                            <span>📦 {task.module.module_name}</span>
                                        )}
                                        {task.due_date && (
                                            <span>📅 Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>

                                <span className={`px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(task.task_priority)}`}>
                                    {getPriorityLabel(task.task_priority)}
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAccept(task.task_id)}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
                                >
                                    ✓ Accept Task
                                </button>
                                <button
                                    onClick={() => handleReject(task.task_id)}
                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
                                >
                                    ✗ Reject Task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
