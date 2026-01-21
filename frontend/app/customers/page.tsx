'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { PageHeader, LoadingSpinner, EmptyState, StatusBadge } from '@/components/shared';
import { useCustomers } from '@/hooks/use-customers';

export default function CustomersPage() {
    const { customers, loading, deleteCustomer } = useCustomers();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const filtered = customers.filter(c => {
        const matchesSearch = c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || c.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Delete customer "${name}"?`)) {
            const result = await deleteCustomer(id);
            if (!result.success) alert(result.error);
        }
    };

    return (
        <Sidebar>
            <PageHeader title="Customer Management" backHref="/dashboard" action={<Link href="/customers/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add Customer</Link>} />
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
                    {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState message="No customers found" /> : (
                        <table className="min-w-full relative">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase shadow-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map(c => (
                                    <tr key={c.customer_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium">{c.customer_name}</td>
                                        <td className="px-6 py-4 text-sm">{c.company || '-'}</td>
                                        <td className="px-6 py-4 text-sm">{c.email || '-'}</td>
                                        <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                                        <td className="px-6 py-4 text-sm space-x-2">
                                            <Link href={`/customers/${c.customer_id}/edit`} className="text-blue-600">Edit</Link>
                                            <button onClick={() => handleDelete(c.customer_id, c.customer_name)} className="text-red-600">Delete</button>
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
