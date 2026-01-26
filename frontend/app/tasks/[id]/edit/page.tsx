'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import EnhancedTaskForm from '@/components/tasks/EnhancedTaskForm';
import { Task } from '@/types';

export default function EditTaskPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params?.id as string;
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (taskId) {
            fetchTask();
        }
    }, [taskId]);

    const fetchTask = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tasks/${taskId}`);
            if (response.data.success) {
                setTask(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching task:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <p className="text-red-500 mb-4">Task not found</p>
                <Link href="/tasks" className="text-blue-600 hover:underline">
                    Back to Tasks
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href={`/tasks/${taskId}/details`} className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
                        ← Back to Task Details
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Task: {task.task_name}
                    </h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <EnhancedTaskForm
                    taskId={taskId}
                    initialData={task}
                    onSuccess={() => router.push(`/tasks/${taskId}/details`)}
                    onCancel={() => router.push(`/tasks/${taskId}/details`)}
                />
            </main>
        </div>
    );
}
