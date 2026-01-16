'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface ModuleObject {
    id: number;
    module_id: number;
    object_name: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    created_at: string;
    module?: {
        id: number;
        module_name: string;
        project?: {
            project_id: number;
            project_name: string;
        };
    };
}

export default function ObjectsPage() {
    const params = useParams();
    const router = useRouter();
    const moduleId = params.id as string;

    const [objects, setObjects] = useState<ModuleObject[]>([]);
    const [module, setModule] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingObject, setEditingObject] = useState<ModuleObject | null>(null);
    const [formData, setFormData] = useState({
        object_name: '',
        description: '',
        status: 'active'
    });

    useEffect(() => {
        fetchModule();
        fetchObjects();
    }, [moduleId]);

    const fetchModule = async () => {
        try {
            const response = await api.get(`/modules/${moduleId}`);
            if (response.data.success) {
                setModule(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching module:', error);
        }
    };

    const fetchObjects = async () => {
        try {
            const response = await api.get(`/objects?module_id=${moduleId}`);
            if (response.data.success) {
                setObjects(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching objects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = { ...formData, module_id: moduleId };
            if (editingObject) {
                await api.put(`/objects/${editingObject.id}`, data);
            } else {
                await api.post('/objects', data);
            }
            setShowModal(false);
            resetForm();
            fetchObjects();
        } catch (error: any) {
            console.error('Error saving object:', error);
            if (error.response?.data?.errors) {
                alert('Validation Errors:\n' + JSON.stringify(error.response.data.errors, null, 2));
            } else {
                alert('Error saving object: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleEdit = (obj: ModuleObject) => {
        setEditingObject(obj);
        setFormData({
            object_name: obj.object_name,
            description: obj.description || '',
            status: obj.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this object?')) {
            try {
                await api.delete(`/objects/${id}`);
                fetchObjects();
            } catch (error) {
                console.error('Error deleting object:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            object_name: '',
            description: '',
            status: 'active'
        });
        setEditingObject(null);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                <button onClick={() => router.push('/modules')} className="hover:text-blue-600">
                    Modules
                </button>
                <span>/</span>
                <span className="text-gray-900 font-semibold">{module?.module_name}</span>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Objects</h1>
                    <p className="text-gray-600 mt-1">
                        Module: {module?.module_name} | Project: {module?.project?.project_name}
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    + Add Object
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {objects.map((obj) => (
                    <div key={obj.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">{obj.object_name}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${obj.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {obj.status}
                            </span>
                        </div>

                        {obj.description && (
                            <p className="text-gray-500 text-sm mb-4">{obj.description}</p>
                        )}

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => router.push(`/modules/${moduleId}/objects/${obj.id}/sub-objects`)}
                                className="flex-1 bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
                            >
                                Sub-Objects
                            </button>
                            <button
                                onClick={() => handleEdit(obj)}
                                className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(obj.id)}
                                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {objects.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No objects found. Create your first object to get started.
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingObject ? 'Edit Object' : 'Add Object'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Object Name</label>
                                <input
                                    type="text"
                                    value={formData.object_name}
                                    onChange={(e) => setFormData({ ...formData, object_name: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    rows={3}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
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
                                    {editingObject ? 'Update' : 'Create'}
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
    );
}
