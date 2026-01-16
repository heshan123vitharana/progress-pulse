'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { PageHeader, LoadingSpinner } from '@/components/shared';
import { useUsers } from '@/hooks/use-users';

export default function UsersPage() {
    const { users, roles, loading, deleteUser } = useUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');

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

    return (
        <Sidebar>
            <PageHeader title="User Management" backHref="/dashboard" action={<Link href="/users/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add User</Link>} />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white placeholder-gray-500" />
                        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
                            <option value="">All Roles</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>
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
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{roles.find(r => r.id === u.role_id)?.name || '-'}</td>
                                        <td className="px-6 py-4 text-sm space-x-2">
                                            <Link href={`/users/${u.id}/edit`} className="text-blue-600 font-medium hover:text-blue-800">Edit</Link>
                                            <button onClick={() => handleDelete(u.id, u.name)} className="text-red-600 font-medium hover:text-red-800">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </Sidebar>
    );
}
