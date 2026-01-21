'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/roles');
            setRoles(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) { }
        setLoading(false);
    };

    const handleEdit = (role: any) => {
        setFormData({ name: role.name, description: role.description || '' });
        setEditingId(role.id);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/roles/${editingId}`, formData);
            } else {
                await api.post('/roles', formData);
            }
            setFormData({ name: '', description: '' });
            setEditingId(null);
            setShowForm(false);
            fetchRoles();
        } catch (error) {
            console.error('Failed to save role:', error);
            alert('Failed to save role');
        }
    };

    const deleteRole = async (id: number) => {
        if (confirm('Delete role?')) {
            await api.delete(`/roles/${id}`);
            fetchRoles();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
                    <div>
                        <Link href="/dashboard" className="text-blue-600 text-sm block mb-1">← Back</Link>
                        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ name: '', description: '' });
                            setEditingId(null);
                            setShowForm(!showForm);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        {showForm && !editingId ? 'Close Form' : '+ Add Role'}
                    </button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-8">
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
                        <h2 className="text-lg font-semibold">{editingId ? 'Edit Role' : 'Create New Role'}</h2>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Role Name *</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                            <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white" />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                    setFormData({ name: '', description: '' });
                                }}
                                className="px-6 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                                {editingId ? 'Update Role' : 'Create Role'}
                            </button>
                        </div>
                    </form>
                )}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? <div className="p-8 text-center">Loading...</div> : (
                        <table className="min-w-full">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Role Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {roles.map(r => (
                                    <tr key={r.id}>
                                        <td className="px-6 py-4 text-sm font-medium">{r.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{r.description || '-'}</td>
                                        <td className="px-6 py-4 text-sm space-x-3">
                                            <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-800">Edit</button>
                                            <button onClick={() => deleteRole(r.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}
