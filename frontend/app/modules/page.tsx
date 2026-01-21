'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';

interface Module {
    id: number;
    project_id: number;
    module_name: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    created_at: string;
    project?: {
        project_id: number;
        project_name: string;
    };
}

export default function ModulesPage() {
    const router = useRouter();
    const [modules, setModules] = useState<Module[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [formData, setFormData] = useState({
        project_id: '',
        module_name: '',
        description: '',
        status: 'active'
    });

    useEffect(() => {
        fetchModules();
        fetchProjects();
    }, []);

    const fetchModules = async () => {
        try {
            const response = await api.get('/modules');
            if (response.data.success) {
                setModules(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingModule) {
                await api.put(`/modules/${editingModule.id}`, formData);
            } else {
                await api.post('/modules', formData);
            }
            setShowModal(false);
            resetForm();
            fetchModules();
        } catch (error: any) {
            console.error('Error saving module:', error);
            if (error.response?.data?.errors) {
                alert('Validation Errors:\n' + JSON.stringify(error.response.data.errors, null, 2));
            } else {
                alert('Error saving module: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleEdit = (module: Module) => {
        setEditingModule(module);
        setFormData({
            project_id: module.project_id.toString(),
            module_name: module.module_name,
            description: module.description || '',
            status: module.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this module?')) {
            try {
                await api.delete(`/modules/${id}`);
                fetchModules();
            } catch (error) {
                console.error('Error deleting module:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            project_id: '',
            module_name: '',
            description: '',
            status: 'active'
        });
        setEditingModule(null);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'archived': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <Sidebar>
                <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Loading modules...</p>
                    </div>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Modules</h1>
                            <p className="text-slate-500 text-sm">{modules.length} total modules</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Module
                    </button>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {modules.map((module) => (
                        <div
                            key={module.id}
                            className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 relative overflow-hidden"
                        >
                            {/* Decorative gradient */}
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">{module.module_name}</h3>
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(module.status)}`}>
                                    {module.status}
                                </span>
                            </div>

                            <div className="flex items-center text-sm text-slate-500 mb-3">
                                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                <span className="font-medium text-slate-600">{module.project?.project_name || 'No Project'}</span>
                            </div>

                            {module.description && (
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{module.description}</p>
                            )}

                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => router.push(`/modules/${module.id}/objects`)}
                                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-violet-600 hover:to-purple-700 shadow-sm hover:shadow-lg transition-all"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Objects
                                </button>
                                <button
                                    onClick={() => handleEdit(module)}
                                    className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(module.id)}
                                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {modules.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No modules found</h3>
                        <p className="text-slate-500 mb-6">Create your first module to get started</p>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Module
                        </button>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600">
                                <h2 className="text-xl font-bold text-white">
                                    {editingModule ? 'Edit Module' : 'Add New Module'}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Project</label>
                                    <select
                                        value={formData.project_id}
                                        onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        required
                                    >
                                        <option value="">Select Project</option>
                                        {projects.map((project) => (
                                            <option key={project.project_id} value={project.project_id}>
                                                {project.project_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Module Name</label>
                                    <input
                                        type="text"
                                        value={formData.module_name}
                                        onChange={(e) => setFormData({ ...formData, module_name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        placeholder="Enter module name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                                        rows={3}
                                        placeholder="Enter description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    >
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="completed">Completed</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all"
                                    >
                                        {editingModule ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
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
