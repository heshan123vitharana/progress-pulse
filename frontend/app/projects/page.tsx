'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { PageHeader, LoadingSpinner, EmptyState, StatusBadge } from '@/components/shared';
import { useProjects } from '@/hooks/use-projects';

export default function ProjectsPage() {
    const { projects, customers, loading, deleteProject } = useProjects();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCustomer, setFilterCustomer] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const filtered = projects.filter(p => {
        const matchesSearch = p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) || p.project_code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCustomer = !filterCustomer || p.customer?.customer_id?.toString() === filterCustomer;
        const matchesStatus = !filterStatus || p.status === filterStatus;
        return matchesSearch && matchesCustomer && matchesStatus;
    });

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Delete project "${name}"?`)) {
            const result = await deleteProject(id);
            if (!result.success) alert(result.error);
        }
    };

    return (
        <Sidebar>
            <PageHeader title="Project Management" backHref="/dashboard" action={<Link href="/projects/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add Project</Link>} />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white placeholder-gray-500" />
                        <select value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
                            <option value="">All Customers</option>
                            {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>)}
                        </select>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
                        </select>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState message="No projects found" /> : (
                        <table className="min-w-full relative">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map(p => (
                                    <tr key={p.project_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium">{p.project_code}</td>
                                        <td className="px-6 py-4 text-sm">{p.project_name}</td>
                                        <td className="px-6 py-4 text-sm">{p.customer?.customer_name || '-'}</td>
                                        <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                                        <td className="px-6 py-4 text-sm space-x-2">
                                            <Link href={`/projects/${p.project_id}/edit`} className="text-blue-600">Edit</Link>
                                            <button onClick={() => handleDelete(p.project_id, p.project_name)} className="text-red-600">Delete</button>
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
