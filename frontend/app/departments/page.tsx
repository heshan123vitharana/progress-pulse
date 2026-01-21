'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useDepartments } from '@/hooks/use-departments';

export default function DepartmentsPage() {
    const { departments, loading, deleteDepartment } = useDepartments();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const filtered = departments.filter(d => {
        const matchesSearch = d.department_name.toLowerCase().includes(searchTerm.toLowerCase()) || d.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || d.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Delete department "${name}"?`)) {
            const result = await deleteDepartment(id);
            if (!result.success) alert(result.error);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <Sidebar>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Departments</h1>
                            <p className="text-slate-500 text-sm">{filtered.length} of {departments.length} departments</p>
                        </div>
                    </div>
                    <Link 
                        href="/departments/create" 
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30 hover:shadow-xl transition-all"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Department
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 mb-6 border border-slate-200/50">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input 
                                type="text" 
                                placeholder="Search departments..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                            />
                        </div>
                        <select 
                            value={filterStatus} 
                            onChange={e => setFilterStatus(e.target.value)} 
                            className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-500 font-medium">Loading departments...</p>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                                <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No departments found</h3>
                            <p className="text-slate-500 mb-6">Add your first department to get started</p>
                            <Link 
                                href="/departments/create" 
                                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30 transition-all"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Department
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map(d => (
                                        <tr key={d.department_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-teal-500/25 mr-3">
                                                        {d.department_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-800">{d.department_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{d.description || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(d.status)}`}>
                                                    {d.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Link 
                                                        href={`/departments/${d.department_id}/edit`} 
                                                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(d.department_id, d.department_name)} 
                                                        className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Sidebar>
    );
}
