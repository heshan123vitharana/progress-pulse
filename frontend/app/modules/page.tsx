'use client';
// Force re-compile

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <Sidebar>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Modules</h1>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        + Add Module
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map((module) => (
                        <div key={module.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">{module.module_name}</h3>
                                <span className={`px-2 py-1 rounded text-xs ${module.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {module.status}
                                </span>
                            </div>

                            <p className="text-gray-600 mb-2 text-sm">
                                <strong>Project:</strong> {module.project?.project_name || 'N/A'}
                            </p>

                            {module.description && (
                                <p className="text-gray-500 text-sm mb-4">{module.description}</p>
                            )}

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => router.push(`/modules/${module.id}/objects`)}
                                    className="flex-1 bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
                                >
                                    View Objects
                                </button>
                                <button
                                    onClick={() => handleEdit(module)}
                                    className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(module.id)}
                                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {modules.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No modules found. Create your first module to get started.
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">
                                {editingModule ? 'Edit Module' : 'Add Module'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Project</label>
                                    <select
                                        value={formData.project_id}
                                        onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
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

                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Module Name</label>
                                    <input
                                        type="text"
                                        value={formData.module_name}
                                        onChange={(e) => setFormData({ ...formData, module_name: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                                        rows={3}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="completed">Completed</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        {editingModule ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
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
