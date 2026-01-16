'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface SubObject {
  id: number;
  object_id: number;
  sub_object_name: string;
  description: string;
  status: number;
  created_at: string;
  object?: {
    id: number;
    object_name: string;
    module?: {
      id: number;
      module_name: string;
    };
  };
}

export default function SubObjectsPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;
  const objectId = params.objectId as string;
  
  const [subObjects, setSubObjects] = useState<SubObject[]>([]);
  const [object, setObject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubObject, setEditingSubObject] = useState<SubObject | null>(null);
  const [formData, setFormData] = useState({
    sub_object_name: '',
    description: '',
    status: 1
  });

  useEffect(() => {
    fetchObject();
    fetchSubObjects();
  }, [objectId]);

  const fetchObject = async () => {
    try {
      const response = await api.get(`/objects/${objectId}`);
      if (response.data.success) {
        setObject(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching object:', error);
    }
  };

  const fetchSubObjects = async () => {
    try {
      const response = await api.get(`/sub-objects?object_id=${objectId}`);
      if (response.data.success) {
        setSubObjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sub-objects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, object_id: objectId };
      if (editingSubObject) {
        await api.put(`/sub-objects/${editingSubObject.id}`, data);
      } else {
        await api.post('/sub-objects', data);
      }
      setShowModal(false);
      resetForm();
      fetchSubObjects();
    } catch (error) {
      console.error('Error saving sub-object:', error);
    }
  };

  const handleEdit = (subObj: SubObject) => {
    setEditingSubObject(subObj);
    setFormData({
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
      sub_object_name: '',
      description: '',
      status: 1
    });
    setEditingSubObject(null);
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
        <button onClick={() => router.push(`/modules/${moduleId}/objects`)} className="hover:text-blue-600">
          {object?.module?.module_name}
        </button>
        <span>/</span>
        <span className="text-gray-900 font-semibold">{object?.object_name}</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sub-Objects</h1>
          <p className="text-gray-600 mt-1">
            Object: {object?.object_name} | Module: {object?.module?.module_name}
          </p>
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
              <span className={`px-2 py-1 rounded text-xs ${subObj.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {subObj.status === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>
            
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
                <label className="block text-gray-700 mb-2">Sub-Object Name</label>
                <input
                  type="text"
                  value={formData.sub_object_name}
                  onChange={(e) => setFormData({ ...formData, sub_object_name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
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
  );
}
