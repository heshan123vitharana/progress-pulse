'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';

interface ObjectItem {
    id: number;
    module_id: number;
    object_name: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    created_at: string;
    module?: {
        id: number;
        module_name: string;
    };
}

export default function ObjectsPage() {
    const router = useRouter();
    const [objects, setObjects] = useState<ObjectItem[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingObject, setEditingObject] = useState<ObjectItem | null>(null);
    const [formData, setFormData] = useState({
        module_id: '',
        object_name: '',
        description: '',
        status: 'active'
    });

    useEffect(() => {
        fetchObjects();
        fetchModules();
    }, []);

    const fetchObjects = async () => {
        try {
            const response = await api.get('/objects');
            if (response.data.success) {
                setObjects(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching objects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchModules = async () => {
        try {
            const response = await api.get('/modules');
            const data = response.data.success ? response.data.data : [];
            setModules(data);
        } catch (error) {
            console.error('Error fetching modules:', error);
            setModules([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                module_id: parseInt(formData.module_id)
            };
            if (editingObject) {
                await api.put(`/objects/${editingObject.id}`, payload);
            } else {
                await api.post('/objects', payload);
            }
            setShowModal(false);
            resetForm();
            fetchObjects();
        } catch (error: any) {
            console.error('Error saving object:', error);
            alert('Error saving object: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (obj: ObjectItem) => {
        setEditingObject(obj);
        setFormData({
            module_id: obj.module_id.toString(),
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
            module_id: '',
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
        <Sidebar>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Objects</h1>
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

                            <p className="text-gray-600 mb-2 text-sm">
                                <strong>Module:</strong> {obj.module?.module_name || 'N/A'}
                            </p>

                            {obj.description && (
                                <p className="text-gray-500 text-sm mb-4">{obj.description}</p>
                            )}

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => router.push(`/sub-objects?object_id=${obj.id}`)}
                                    className="flex-1 bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
                                >
                                    View Sub-Objects
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
                                    <label className="block text-gray-700 mb-2">Module</label>
                                    <select
                                        value={formData.module_id}
                                        onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                                        required
                                    >
                                        <option value="">Select Module</option>
                                        {modules.map((module) => (
                                            <option key={module.id} value={module.id}>
                                                {module.module_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Object Name</label>
                                    <input
                                        type="text"
                                        value={formData.object_name}
                                        onChange={(e) => setFormData({ ...formData, object_name: e.target.value })}
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
        </Sidebar >
    );
}
