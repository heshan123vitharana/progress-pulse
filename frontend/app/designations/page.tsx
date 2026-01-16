'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { PageHeader, LoadingSpinner, EmptyState, StatusBadge } from '@/components/shared';
import { useDesignations } from '@/hooks/use-designations';

export default function DesignationsPage() {
    const { designations, loading, deleteDesignation } = useDesignations();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const filtered = designations.filter(d => {
        const matchesSearch = d.designation_name.toLowerCase().includes(searchTerm.toLowerCase()) || d.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || d.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Delete designation "${name}"?`)) {
            const result = await deleteDesignation(id);
            if (!result.success) alert(result.error);
        }
    };

    return (
        <Sidebar>
            <PageHeader title="Designation Management" backHref="/dashboard" action={<Link href="/designations/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add Designation</Link>} />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white placeholder-gray-500" />
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState message="No designations found" /> : (
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map(d => (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium">{d.designation_name}</td>
                                        <td className="px-6 py-4 text-sm">{d.description || '-'}</td>
                                        <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                                        <td className="px-6 py-4 text-sm space-x-2">
                                            <Link href={`/designations/${d.id}/edit`} className="text-blue-600">Edit</Link>
                                            <button onClick={() => handleDelete(d.id, d.designation_name)} className="text-red-600">Delete</button>
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
