'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ user_id: '', action: '', date: '' });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/activity-logs', { params: filters });
            setLogs(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) { }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link href="/dashboard" className="text-blue-600 text-sm block mb-1">← Back</Link>
                    <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Date</label>
                            <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Action</label>
                            <select value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white">
                                <option value="">All Actions</option>
                                <option value="create">Create</option>
                                <option value="update">Update</option>
                                <option value="delete">Delete</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={fetchLogs} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg">Filter</button>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? <div className="p-8 text-center">Loading...</div> : (
                        <div className="divide-y">
                            {logs.map((log, i) => (
                                <div key={i} className="p-4 hover:bg-gray-50">
                                    <div className="flex justify-between">
                                        <div>
                                            <span className="font-medium">{log.user?.name || 'System'}</span>
                                            <span className="text-gray-500 ml-2">{log.action}</span>
                                            <span className="text-gray-500 ml-2">{log.model}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                    {log.description && <p className="text-sm text-gray-600 mt-1">{log.description}</p>}
                                </div>
                            ))}
                            {logs.length === 0 && <div className="p-8 text-center text-gray-500">No activity logs found</div>}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
