'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface EnhancedTaskFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function EnhancedTaskForm({ onSuccess, onCancel }: EnhancedTaskFormProps) {
    const [projects, setProjects] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [objects, setObjects] = useState<any[]>([]);
    const [subObjects, setSubObjects] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        project_id: '',
        module_id: '',
        object_id: '',
        sub_object_id: '',
        task_name: '',
        description: '',
        task_type: 'self_assign',
        department_id: '',
        assigned_employee_id: '',
        task_priority: 1,
        due_date: '',
        due_time: ''
    });

    useEffect(() => {
        fetchProjects();
        fetchDepartments();
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (formData.project_id) {
            fetchModules(formData.project_id);
        }
    }, [formData.project_id]);

    useEffect(() => {
        if (formData.module_id) {
            fetchObjects(formData.module_id);
        }
    }, [formData.module_id]);

    useEffect(() => {
        if (formData.object_id) {
            fetchSubObjects(formData.object_id);
        }
    }, [formData.object_id]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            if (response.data.success) {
                setProjects(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchModules = async (projectId: string) => {
        try {
            const response = await api.get(`/modules?project_id=${projectId}`);
            if (response.data.success) {
                setModules(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
        }
    };

    const fetchObjects = async (moduleId: string) => {
        try {
            const response = await api.get(`/objects?module_id=${moduleId}`);
            if (response.data.success) {
                setObjects(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching objects:', error);
        }
    };

    const fetchSubObjects = async (objectId: string) => {
        try {
            const response = await api.get(`/sub-objects?object_id=${objectId}`);
            if (response.data.success) {
                setSubObjects(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching sub-objects:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/departments');
            if (response.data.success) {
                setDepartments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            if (response.data.success) {
                setEmployees(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tasks/create', formData);
            toast.success('Task created successfully!');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error creating task:', error);
            toast.error(error.response?.data?.message || 'Failed to create task');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white text-gray-900 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Create New Task</h2>

            {/* Task Type Selection */}
            <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-3">Task Type</label>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, task_type: 'self_assign' })}
                        className={`p-4 rounded-lg border-2 transition-all ${formData.task_type === 'self_assign'
                            ? 'border-blue-600 bg-blue-100'
                            : 'border-gray-300 hover:border-blue-400'
                            }`}
                    >
                        <div className="font-semibold">Self-Assign</div>
                        <div className="text-xs text-gray-600 mt-1">Assign to yourself</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, task_type: 'assign_to_others' })}
                        className={`p-4 rounded-lg border-2 transition-all ${formData.task_type === 'assign_to_others'
                            ? 'border-green-600 bg-green-100'
                            : 'border-gray-300 hover:border-green-400'
                            }`}
                    >
                        <div className="font-semibold">Assign to Others</div>
                        <div className="text-xs text-gray-600 mt-1">Assign to team member</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, task_type: 'public' })}
                        className={`p-4 rounded-lg border-2 transition-all ${formData.task_type === 'public'
                            ? 'border-purple-600 bg-purple-100'
                            : 'border-gray-300 hover:border-purple-400'
                            }`}
                    >
                        <div className="font-semibold">Public</div>
                        <div className="text-xs text-gray-600 mt-1">Anyone can claim</div>
                    </button>
                </div>
            </div>

            {/* Hierarchical Selection */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 mb-2">Project *</label>
                    <select
                        value={formData.project_id}
                        onChange={(e) => setFormData({ ...formData, project_id: e.target.value, module_id: '', object_id: '', sub_object_id: '' })}
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

                <div>
                    <label className="block text-gray-700 mb-2">Module</label>
                    <select
                        value={formData.module_id}
                        onChange={(e) => setFormData({ ...formData, module_id: e.target.value, object_id: '', sub_object_id: '' })}
                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                        disabled={!formData.project_id}
                    >
                        <option value="">Select Module (Optional)</option>
                        {modules.map((module) => (
                            <option key={module.id} value={module.id}>
                                {module.module_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Object</label>
                    <select
                        value={formData.object_id}
                        onChange={(e) => setFormData({ ...formData, object_id: e.target.value, sub_object_id: '' })}
                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                        disabled={!formData.module_id}
                    >
                        <option value="">Select Object (Optional)</option>
                        {objects.map((obj) => (
                            <option key={obj.id} value={obj.id}>
                                {obj.object_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Sub-Object</label>
                    <select
                        value={formData.sub_object_id}
                        onChange={(e) => setFormData({ ...formData, sub_object_id: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                        disabled={!formData.object_id}
                    >
                        <option value="">Select Sub-Object (Optional)</option>
                        {subObjects.map((subObj) => (
                            <option key={subObj.id} value={subObj.id}>
                                {subObj.sub_object_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Task Details */}
            <div>
                <label className="block text-gray-700 mb-2">Task Name *</label>
                <input
                    type="text"
                    value={formData.task_name}
                    onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={4}
                />
            </div>

            {/* Conditional Fields Based on Task Type */}
            {formData.task_type === 'assign_to_others' && (
                <div>
                    <label className="block text-gray-700 mb-2">Assign To *</label>
                    <select
                        value={formData.assigned_employee_id}
                        onChange={(e) => setFormData({ ...formData, assigned_employee_id: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                        required
                    >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                            <option key={employee.employee_id} value={employee.employee_id}>
                                {employee.first_name} {employee.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {formData.task_type === 'public' && (
                <div>
                    <label className="block text-gray-700 mb-2">Department *</label>
                    <select
                        value={formData.department_id}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept.department_id} value={dept.department_id}>
                                {dept.department}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-gray-700 mb-2">Priority *</label>
                    <select
                        value={formData.task_priority}
                        onChange={(e) => setFormData({ ...formData, task_priority: parseInt(e.target.value) })}
                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                    >
                        <option value={1}>Low</option>
                        <option value={2}>Medium</option>
                        <option value={3}>High</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Due Date</label>
                    <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Due Time</label>
                    <input
                        type="time"
                        value={formData.due_time}
                        onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                    Create Task
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
