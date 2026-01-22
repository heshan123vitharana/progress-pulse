'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';

// Permission categories for grouping
const PERMISSION_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
    dashboard: { label: 'Dashboard', icon: '📊', color: 'blue' },
    employees: { label: 'Employees', icon: '👥', color: 'purple' },
    tasks: { label: 'Tasks', icon: '✓', color: 'green' },
    projects: { label: 'Projects', icon: '📁', color: 'indigo' },
    modules: { label: 'Modules', icon: '📦', color: 'cyan' },
    objects: { label: 'Objects', icon: '🔷', color: 'teal' },
    customers: { label: 'Customers', icon: '🏢', color: 'amber' },
    reports: { label: 'Reports', icon: '📈', color: 'orange' },
    timesheet: { label: 'Timesheet', icon: '⏱️', color: 'pink' },
    admin: { label: 'Administration', icon: '⚙️', color: 'red' },
};

function getCategoryFromSlug(slug: string): string {
    if (slug.includes('dashboard')) return 'dashboard';
    if (slug.includes('employee')) return 'employees';
    if (slug.includes('task') && !slug.includes('customer')) return 'tasks';
    if (slug.includes('project')) return 'projects';
    if (slug.includes('module')) return 'modules';
    if (slug.includes('object')) return 'objects';
    if (slug.includes('customer')) return 'customers';
    if (slug.includes('report') || slug.includes('analytics')) return 'reports';
    if (slug.includes('timesheet')) return 'timesheet';
    return 'admin';
}

function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Loading roles...</p>
        </div>
    );
}

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedRole, setExpandedRole] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/roles');
            setRoles(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) {
            toast.error('Failed to load roles');
        }
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

    const toggleCategoryPermissions = (category: string, perms: any[]) => {
        const categoryPermIds = perms.map(p => p.id);
        const allSelected = categoryPermIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(id => !categoryPermIds.includes(id)));
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...categoryPermIds])]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData, permissions: selectedPermissions };
            if (editingId) {
                await api.put(`/roles/${editingId}`, payload);
                toast.success('Role updated successfully');
            } else {
                await api.post('/roles', payload);
                toast.success('Role created successfully');
            }
            setFormData({ name: '', description: '' });
            setSelectedPermissions([]);
            setEditingId(null);
            setShowForm(false);
            fetchRoles();
        } catch (error) {
            toast.error('Failed to save role');
        } finally {
            setSaving(false);
        }
    };

    const deleteRole = async (id: string, name: string) => {
        if (confirm(`Delete role "${name}"? This action cannot be undone.`)) {
            try {
                await api.delete(`/roles/${id}`);
                toast.success('Role deleted');
                fetchRoles();
            } catch (error) {
                toast.error('Failed to delete role');
            }
        }
    };

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc: any, perm: any) => {
        const category = getCategoryFromSlug(perm.slug || '');
        if (!acc[category]) acc[category] = [];
        acc[category].push(perm);
        return acc;
    }, {});

    const getRoleColor = (name: string) => {
        const colors: Record<string, string> = {
            'Admin': 'from-red-500 to-orange-500',
            'Manager': 'from-purple-500 to-indigo-500',
            'QA': 'from-emerald-500 to-teal-500',
            'Implementation Officer': 'from-blue-500 to-cyan-500',
            'Developer': 'from-amber-500 to-yellow-500',
        };
        return colors[name] || 'from-slate-400 to-slate-500';
    };

    const getRoleBadgeColor = (name: string) => {
        const colors: Record<string, string> = {
            'Admin': 'bg-red-50 text-red-600 border-red-100',
            'Manager': 'bg-purple-50 text-purple-600 border-purple-100',
            'QA': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'Implementation Officer': 'bg-blue-50 text-blue-600 border-blue-100',
            'Developer': 'bg-amber-50 text-amber-600 border-amber-100',
        };
        return colors[name] || 'bg-slate-50 text-slate-600 border-slate-100';
    };

    return (
        <Sidebar>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Roles & Permissions</h1>
                            <p className="text-slate-500 text-sm">Manage user roles and access rights</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ name: '', description: '' });
                            setSelectedPermissions([]);
                            setEditingId(null);
                            setShowForm(!showForm);
                        }}
                        className={`inline-flex items-center px-5 py-2.5 font-medium rounded-xl transition-all shadow-lg hover:shadow-xl ${showForm
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none'
                                : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-blue-500/30'
                            }`}
                    >
                        {showForm ? (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Close Form
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Role
                            </>
                        )}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                            {editingId ? 'Edit Role Details' : 'Create New Role'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role Name *</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        placeholder="e.g., Project Manager"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <input
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Role responsibility summary"
                                    />
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-slate-700">Permissions Configuration</label>
                                    <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                                        {selectedPermissions.length} selected
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {Object.entries(PERMISSION_CATEGORIES).map(([key, { label, icon }]) => {
                                        const categoryPerms = groupedPermissions[key] || [];
                                        if (categoryPerms.length === 0) return null;

                                        const selectedCount = categoryPerms.filter((p: any) => selectedPermissions.includes(p.id)).length;
                                        const allSelected = selectedCount === categoryPerms.length && categoryPerms.length > 0;

                                        return (
                                            <div key={key} className={`bg-white rounded-lg border transition-all duration-200 ${allSelected ? 'border-blue-200 shadow-sm' : 'border-slate-200'}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCategoryPermissions(key, categoryPerms)}
                                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-lg"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{icon}</span>
                                                        <span className="text-sm font-medium text-slate-700">{label}</span>
                                                    </div>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${allSelected
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : selectedCount > 0
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {selectedCount}/{categoryPerms.length}
                                                    </span>
                                                </button>
                                                <div className="px-4 pb-3 pt-1 border-t border-slate-50 space-y-1">
                                                    {categoryPerms.map((p: any) => (
                                                        <label key={p.id} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                                                            <div className="relative flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedPermissions.includes(p.id)}
                                                                    onChange={() => togglePermission(p.id)}
                                                                    className="peer w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                                                />
                                                            </div>
                                                            <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors select-none">{p.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setFormData({ name: '', description: '' });
                                        setSelectedPermissions([]);
                                    }}
                                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-medium rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : editingId ? 'Update Role' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Roles Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner />
                    </div>
                ) : roles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-1">No roles found</h3>
                        <p className="text-slate-500 mb-4">Create your first role to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {roles.map(role => (
                            <div
                                key={role.id}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/60 overflow-hidden relative"
                            >
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getRoleColor(role.name)}`}></div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                                {role.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                                {role.description || 'No description provided'}
                                            </p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getRoleBadgeColor(role.name)}`}>
                                            {role.permissions?.length || 0} Perms
                                        </div>
                                    </div>

                                    {/* Permission Tags Preview */}
                                    {role.permissions && role.permissions.length > 0 && (
                                        <div className="mt-4 mb-6">
                                            <button
                                                onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                                                className="text-xs font-medium text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors mb-2"
                                            >
                                                {expandedRole === role.id ? 'Hide' : 'View'} Permissions
                                                <svg className={`w-3 h-3 transition-transform ${expandedRole === role.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            <div className="flex flex-wrap gap-1.5 h-[56px] overflow-hidden content-start">
                                                {(expandedRole === role.id ? permissions.filter(p => role.permissions.includes(p.id)) : permissions.filter(p => role.permissions.includes(p.id)).slice(0, 5)).map((p: any) => (
                                                    <span key={p.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md border border-slate-200">
                                                        {p.name}
                                                    </span>
                                                ))}
                                                {expandedRole !== role.id && role.permissions.filter((p: any) => role.permissions.includes(p.id)).length > 5 && (
                                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] rounded-md border border-slate-100">
                                                        +{role.permissions.filter((p: any) => role.permissions.includes(p.id)).length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                                        <button
                                            onClick={() => handleEdit(role)}
                                            className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                        >
                                            Edit Configuration
                                        </button>
                                        <button
                                            onClick={() => deleteRole(role.id, role.name)}
                                            className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Sidebar>
    );
}
