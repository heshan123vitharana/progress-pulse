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
                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Loading sub-objects...</p>
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
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/50 text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-lg transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Sub-Objects</h1>
                                <p className="text-slate-500 text-sm">
                                    {filterObjectId
                                        ? `Filtered by Object ID: ${filterObjectId}`
                                        : `${subObjects.length} total sub-objects`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/30 hover:shadow-xl transition-all"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Sub-Object
                    </button>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {subObjects.map((subObj) => (
                        <div
                            key={subObj.id}
                            className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 relative overflow-hidden"
                        >
                            {/* Decorative gradient */}
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-cyan-600 transition-colors">{subObj.sub_object_name}</h3>
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(subObj.status)}`}>
                                    {subObj.status}
                                </span>
                            </div>

                            <div className="flex items-center text-sm text-slate-500 mb-3">
                                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <span className="font-medium text-slate-600">{subObj.object?.object_name || 'No Object'}</span>
                            </div>

                            {subObj.description && (
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{subObj.description}</p>
                            )}

                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => handleEdit(subObj)}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-amber-50 text-amber-600 text-sm font-medium rounded-xl hover:bg-amber-100 transition-all"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(subObj.id)}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl hover:bg-rose-100 transition-all"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {subObjects.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                            <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No sub-objects found</h3>
                        <p className="text-slate-500 mb-6">Create your first sub-object to get started</p>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/30 transition-all"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Sub-Object
                        </button>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600">
                                <h2 className="text-xl font-bold text-white">
                                    {editingSubObject ? 'Edit Sub-Object' : 'Add New Sub-Object'}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Object</label>
                                    <select
                                        value={formData.object_id}
                                        onChange={(e) => setFormData({ ...formData, object_id: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Sub-Object Name</label>
                                    <input
                                        type="text"
                                        value={formData.sub_object_name}
                                        onChange={(e) => setFormData({ ...formData, sub_object_name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                        placeholder="Enter sub-object name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                                        rows={3}
                                        placeholder="Enter description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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
                                        className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/30 transition-all"
                                    >
                                        {editingSubObject ? 'Update' : 'Create'}
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
