'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';

interface SubObject {
    id: number;
    object_id: number;
    sub_object_name: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    created_at: string;
    object?: {
        id: number;
        object_name: string;
    };
}

export default function SubObjectsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const filterObjectId = searchParams.get('object_id');

    const [subObjects, setSubObjects] = useState<SubObject[]>([]);
    const [objects, setObjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSubObject, setEditingSubObject] = useState<SubObject | null>(null);
    const [formData, setFormData] = useState({
        object_id: filterObjectId || '',
        sub_object_name: '',
        description: '',
        status: 'active'
    });

    useEffect(() => {
        fetchSubObjects();
        fetchObjects();
    }, [filterObjectId]);

    const fetchSubObjects = async () => {
        try {
            const url = filterObjectId
                ? `/sub-objects?object_id=${filterObjectId}`
                : '/sub-objects';
            const response = await api.get(url);
            if (response.data.success) {
                setSubObjects(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching sub-objects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchObjects = async () => {
        try {
            const response = await api.get('/objects');
            const data = response.data.success ? response.data.data : [];
            setObjects(data);
        } catch (error) {
            console.error('Error fetching objects:', error);
            setObjects([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                object_id: parseInt(formData.object_id)
            };
            if (editingSubObject) {
                await api.put(`/sub-objects/${editingSubObject.id}`, payload);
            } else {
                await api.post('/sub-objects', payload);
            }
            setShowModal(false);
            resetForm();
            fetchSubObjects();
        } catch (error: any) {
            console.error('Error saving sub-object:', error);
            alert('Error saving sub-object: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (subObj: SubObject) => {
        setEditingSubObject(subObj);
        setFormData({
            object_id: subObj.object_id.toString(),
            sub_object_name: subObj.sub_object_name,
            description: subObj.description || '',
            status: subObj.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this sub-object?')) {
            try {
                await api.delete(`/sub-objects/${id}`);
                fetchSubObjects();
            } catch (error) {
                console.error('Error deleting sub-object:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            object_id: filterObjectId || '',
            sub_object_name: '',
            description: '',
            status: 'active'
        });
        setEditingSubObject(null);
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
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Sub-Objects</h1>
                            {filterObjectId && (
                                <p className="text-gray-600 mt-1">
                                    Filtered by Object ID: {filterObjectId}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        + Add Sub-Object
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subObjects.map((subObj) => (
                        <div key={subObj.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">{subObj.sub_object_name}</h3>
                                <span className={`px-2 py-1 rounded text-xs ${subObj.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {subObj.status}
                                </span>
                            </div>

                            <p className="text-gray-600 mb-2 text-sm">
                                <strong>Object:</strong> {subObj.object?.object_name || 'N/A'}
                            </p>

                            {subObj.description && (
                                <p className="text-gray-500 text-sm mb-4">{subObj.description}</p>
                            )}

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleEdit(subObj)}
                                    className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(subObj.id)}
                                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {subObjects.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No sub-objects found. Create your first sub-object to get started.
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">
                                {editingSubObject ? 'Edit Sub-Object' : 'Add Sub-Object'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Object</label>
                                    <select
                                        value={formData.object_id}
                                        onChange={(e) => setFormData({ ...formData, object_id: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                                        required
                                    >
                                        <option value="">Select Object</option>
                                        {objects.map((obj) => (
                                            <option key={obj.id} value={obj.id}>
                                                {obj.object_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Sub-Object Name</label>
                                    <input
                                        type="text"
                                        value={formData.sub_object_name}
                                        onChange={(e) => setFormData({ ...formData, sub_object_name: e.target.value })}
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
                                        {editingSubObject ? 'Update' : 'Create'}
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
