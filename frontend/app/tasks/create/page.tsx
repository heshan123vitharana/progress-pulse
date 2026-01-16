'use client';

import Link from 'next/link';
import EnhancedTaskForm from '@/components/tasks/EnhancedTaskForm';
import { useRouter } from 'next/navigation';

export default function CreateTaskPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/tasks" className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
                        ← Back to Tasks
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Create New Task
                    </h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <EnhancedTaskForm
                    onSuccess={() => router.push('/tasks')}
                    onCancel={() => router.push('/tasks')}
                />
            </main>
        </div>
    );
}
