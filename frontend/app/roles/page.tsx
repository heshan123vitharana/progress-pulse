'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/roles');
            setRoles(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) { }
        setLoading(false);
    };

    const fetchPermissions = async () => {
        try {
            const res = await api.get('/permissions');
            setPermissions(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) { }
    };

    const handleEdit = (role: any) => {
        setFormData({ name: role.name, description: role.description || '' });
        setSelectedPermissions(role.permissions || []);
        setEditingId(role.id);
        setShowForm(true);
    };

    const togglePermission = (id: string) => {
        setSelectedPermissions(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, permissions: selectedPermissions };
            if (editingId) {
                await api.put(`/roles/${editingId}`, payload);
            } else {
                await api.post('/roles', payload);
            }
            setFormData({ name: '', description: '' });
            setSelectedPermissions([]);
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

    // ... (deleteRole function)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header omitted for brevity */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
                    <div>
                        <Link href="/dashboard" className="text-blue-600 text-sm block mb-1">← Back</Link>
                        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ name: '', description: '' });
                            setSelectedPermissions([]);
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

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Permissions</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border p-4 rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
                                {permissions.map(p => (
                                    <label key={p.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPermissions.includes(p.id)}
                                            onChange={() => togglePermission(p.id)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{p.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                    setFormData({ name: '', description: '' });
                                    setSelectedPermissions([]);
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
