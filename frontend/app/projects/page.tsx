'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useProjects } from '@/hooks/use-projects';
import api from '@/lib/api';
import { Project, MainProject } from '@/types';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth-store';

export default function ProjectsPage() {
    const { user } = useAuthStore();
    const isAdmin = Number(user?.role_id) === 1;
    const { projects: allProjects, customers, loading: projectsLoading, deleteProject, refetch: refetchProjects } = useProjects();
    const [mainProjects, setMainProjects] = useState<MainProject[]>([]);
    const [loadingMain, setLoadingMain] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [independentProjects, setIndependentProjects] = useState<Project[]>([]);

    // Create Main Project Modal State
    const [isMainProjectModalOpen, setIsMainProjectModalOpen] = useState(false);
    const [newMainProjectName, setNewMainProjectName] = useState('');
    const [creatingMain, setCreatingMain] = useState(false);

    // Edit Main Project Modal State
    const [isEditMainProjectModalOpen, setIsEditMainProjectModalOpen] = useState(false);
    const [editingMainProject, setEditingMainProject] = useState<MainProject | null>(null);
    const [editMainProjectName, setEditMainProjectName] = useState('');
    const [editMainProjectStatus, setEditMainProjectStatus] = useState('');
    const [updatingMain, setUpdatingMain] = useState(false);

    useEffect(() => {
        fetchMainProjects();
    }, []);

    useEffect(() => {
        if (allProjects.length > 0) {
            // Filter projects that don't belong to any main project
            setIndependentProjects(allProjects.filter(p => !p.main_project_id));
        }
    }, [allProjects]);

    const fetchMainProjects = async () => {
        setLoadingMain(true);
        try {
            const res = await api.get('/main-projects');
            if (res.data.success) {
                setMainProjects(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load main projects', error);
        } finally {
            setLoadingMain(false);
        }
    };

    const handleCreateMainProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingMain(true);
        try {
            const res = await api.post('/main-projects', {
                name: newMainProjectName,
                status: 'active'
            });

            if (res.data.success) {
                toast.success('Main Project created successfully');
                setIsMainProjectModalOpen(false);
                setNewMainProjectName('');
                fetchMainProjects();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create main project');
        } finally {
            setCreatingMain(false);
        }
    };

    const handleEditMainProject = (mp: MainProject) => {
        setEditingMainProject(mp);
        setEditMainProjectName(mp.name);
        setEditMainProjectStatus(mp.status);
        setIsEditMainProjectModalOpen(true);
    };

    const handleUpdateMainProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMainProject) return;

        setUpdatingMain(true);
        try {
            const res = await api.put(`/main-projects/${editingMainProject.id}`, {
                name: editMainProjectName,
                status: editMainProjectStatus
            });

            if (res.data.success) {
                toast.success('Product Line updated successfully');
                setIsEditMainProjectModalOpen(false);
                setEditingMainProject(null);
                fetchMainProjects();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update product line');
        } finally {
            setUpdatingMain(false);
        }
    };

    const handleDeleteMainProject = async (id: number, name: string) => {
        if (!confirm(`Delete product line "${name}"? This will also remove all associated deployments.`)) return;

        try {
            const res = await api.delete(`/main-projects/${id}`);
            if (res.data.success) {
                toast.success('Product Line deleted successfully');
                fetchMainProjects();
                refetchProjects();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete product line');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Delete project "${name}"?`)) {
            const result = await deleteProject(id);
            if (!result.success) alert(result.error);
            else {
                fetchMainProjects(); // Refresh main API to update counts/lists if needed
            }
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'on_hold': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    // Filter Logic
    const filterProject = (p: Project) => {
        const matchesSearch = p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.customer?.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    };

    const loading = projectsLoading || loadingMain;

    return (
        <Sidebar>
            <div className="p-6 lg:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Unified Projects</h1>
                            <p className="text-slate-500 text-sm">Manage products and customer deployments</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-4 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
                        </select>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setIsMainProjectModalOpen(true)}
                                    className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    + New Product Line
                                </button>
                                <Link
                                    href="/projects/create"
                                    className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Deployment
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Main Projects Sections */}
                        {mainProjects.map(mp => {
                            const filteredProjects = mp.projects?.filter(filterProject) || [];
                            // Skip if searching and no matches in this group
                            if (searchTerm && filteredProjects.length === 0) return null;

                            return (
                                <div key={mp.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-800">{mp.name}</h2>
                                                <p className="text-xs text-slate-500">{mp.projects?.length || 0} deployments</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(mp.status)}`}>
                                                {mp.status}
                                            </span>
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditMainProject(mp)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Product Line"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMainProject(mp.id, mp.name)}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Delete Product Line"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {filteredProjects.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-slate-100/50">
                                                <thead className="bg-slate-50/30">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Deployment Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                                        {isAdmin && <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100/50">
                                                    {filteredProjects.map(p => (
                                                        <tr key={p.project_id} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <span className="font-medium text-slate-700">{p.customer?.customer_name}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-600">{p.project_name}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{p.project_code}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(p.status)}`}>
                                                                    {p.status}
                                                                </span>
                                                            </td>
                                                            {isAdmin && (
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <Link href={`/projects/${p.project_id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                        </Link>
                                                                        <button onClick={() => handleDelete(p.project_id, p.project_name)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 text-sm">
                                            No deployments found for this product line.
                                            {isAdmin && <Link href="/projects/create" className="text-blue-600 font-medium hover:underline ml-1">Create one</Link>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Independent Projects Section */}
                        {independentProjects.filter(filterProject).length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                                    <h2 className="text-lg font-bold text-slate-800">Other / Independent Projects</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-100/50">
                                        <thead className="bg-slate-50/30">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Project Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                                {isAdmin && <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100/50">
                                            {independentProjects.filter(filterProject).map(p => (
                                                <tr key={p.project_id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <span className="font-medium text-slate-700">{p.customer?.customer_name || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{p.project_name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{p.project_code}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(p.status)}`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={`/projects/${p.project_id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </Link>
                                                                <button onClick={() => handleDelete(p.project_id, p.project_name)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Project Create Modal */}
                {isMainProjectModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Create New Product Line</h2>
                            <form onSubmit={handleCreateMainProject}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newMainProjectName}
                                            onChange={e => setNewMainProjectName(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="e.g. ERP System v2"
                                        />
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        This will create a new top-level product container. You can then add customer deployments to it.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsMainProjectModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creatingMain}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
                                    >
                                        {creatingMain ? 'Creating...' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Main Project Modal */}
                {isEditMainProjectModalOpen && editingMainProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Edit Product Line</h2>
                            <form onSubmit={handleUpdateMainProject}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={editMainProjectName}
                                            onChange={e => setEditMainProjectName(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="e.g. ERP System v2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                        <select
                                            value={editMainProjectStatus}
                                            onChange={e => setEditMainProjectStatus(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        >
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                            <option value="on_hold">On Hold</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditMainProjectModalOpen(false);
                                            setEditingMainProject(null);
                                        }}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updatingMain}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
                                    >
                                        {updatingMain ? 'Updating...' : 'Update Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Sidebar>
    );
}
