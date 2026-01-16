'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) { }
        setLoading(false);
    };

    const markAsRead = async (id: number) => {
        await api.put(`/notifications/${id}/read`);
        fetchNotifications();
    };

    const markAllRead = async () => {
        await api.post('/notifications/mark-all-read');
        fetchNotifications();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
                    <div>
                        <Link href="/dashboard" className="text-blue-600 text-sm block mb-1">← Back</Link>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    </div>
                    {notifications.some(n => !n.read_at) && (
                        <button onClick={markAllRead} className="text-blue-600 text-sm">Mark all as read</button>
                    )}
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? <div className="p-8 text-center">Loading...</div> : (
                        <div className="divide-y">
                            {notifications.map(n => (
                                <div key={n.id} className={`p-4 hover:bg-gray-50 ${!n.read_at ? 'bg-blue-50' : ''}`}>
                                    <div className="flex justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium">{n.title}</p>
                                            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                                            <span className="text-xs text-gray-500 mt-2 block">{new Date(n.created_at).toLocaleString()}</span>
                                        </div>
                                        {!n.read_at && (
                                            <button onClick={() => markAsRead(n.id)} className="text-blue-600 text-sm ml-4">Mark read</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {notifications.length === 0 && <div className="p-8 text-center text-gray-500">No notifications</div>}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
