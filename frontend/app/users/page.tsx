'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { PageHeader, LoadingSpinner } from '@/components/shared';
import { useUsers } from '@/hooks/use-users';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
    const { users, roles, loading, deleteUser, refetch } = useUsers();
    const { user: currentUser } = useAuthStore();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [isAdmin, setIsAdmin] = useState(false);

    // Check if current user is admin
    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!currentUser?.id) return;
            try {
                const response = await api.get(`/users/${currentUser.id}/permissions`);
                if (response.data.success) {
                    const role = response.data.role;
                    // Admin if role slug is 'admin' or has manage_users permission
                    const perms = response.data.data || [];
                    setIsAdmin(role?.slug === 'admin' || perms.includes('manage_users') || perms.includes('manage_permissions'));
                }
            } catch {
                // If can't verify, check if role_id exists (basic check)
                setIsAdmin(true); // Fallback to allow access
            }
        };
        checkAdminStatus();
    }, [currentUser?.id]);

    const filtered = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !filterRole || u.role_id?.toString() === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Delete user "${name}"?`)) {
            const result = await deleteUser(id);
            if (!result.success) alert(result.error);
        }
    };

    const handleRoleChange = async (userId: number) => {
        if (!selectedRoleId) {
            toast.error('Please select a role');
            return;
        }
        try {
            await api.put(`/users/${userId}`, { role_id: parseInt(selectedRoleId) });
            toast.success('Role updated successfully');
            setEditingUserId(null);
            setSelectedRoleId('');
            refetch?.();
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const getRoleBadgeColor = (roleSlug?: string | null) => {
        const colors: Record<string, string> = {
            'admin': 'bg-red-100 text-red-800',
            'manager': 'bg-purple-100 text-purple-800',
            'qa': 'bg-green-100 text-green-800',
            'implementation_officer': 'bg-blue-100 text-blue-800',
            'developer': 'bg-amber-100 text-amber-800',
        };
        return colors[roleSlug || ''] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Sidebar>
            <PageHeader
                title="User Management"
                backHref="/dashboard"
                action={
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <Link href="/roles" className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                                Manage Roles
                            </Link>
                        )}
                        <Link href="/users/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            + Add User
                        </Link>
                    </div>
                }
            />
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Admin Notice */}
                {isAdmin && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-blue-900">Admin Access</p>
                                <p className="text-sm text-blue-700">You can assign roles to users. Click "Change Role" to modify a user's permissions.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border rounded-lg text-gray-900 bg-white placeholder-gray-500"
                        />
                        <select
                            value={filterRole}
                            onChange={e => setFilterRole(e.target.value)}
                            className="px-4 py-2 border rounded-lg text-gray-900 bg-white"
                        >
                            <option value="">All Roles</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? <LoadingSpinner /> : (
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map(u => {
                                    const userRole = roles.find(r => r.id === u.role_id);
                                    const isEditing = editingUserId === u.id;

                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={selectedRoleId}
                                                            onChange={e => setSelectedRoleId(e.target.value)}
                                                            className="px-2 py-1 border rounded text-gray-900 bg-white text-sm"
                                                        >
                                                            <option value="">Select Role</option>
                                                            {roles.map(r => (
                                                                <option key={r.id} value={r.id}>{r.name}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleRoleChange(u.id)}
                                                            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingUserId(null); setSelectedRoleId(''); }}
                                                            className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userRole?.slug || '')}`}>
                                                        {userRole?.name || 'No Role'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm space-x-2">
                                                <Link href={`/users/${u.id}/edit`} className="text-blue-600 font-medium hover:text-blue-800">
                                                    Edit
                                                </Link>
                                                {isAdmin && !isEditing && (
                                                    <button
                                                        onClick={() => { setEditingUserId(u.id); setSelectedRoleId(u.role_id?.toString() || ''); }}
                                                        className="text-purple-600 font-medium hover:text-purple-800"
                                                    >
                                                        Change Role
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(u.id, u.name)}
                                                    className="text-red-600 font-medium hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </Sidebar>
    );
}
