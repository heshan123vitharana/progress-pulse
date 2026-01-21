'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useProjects } from '@/hooks/use-projects';
import { useEmployees } from '@/hooks/use-employees';

export default function ProjectFormPage() {
    const router = useRouter();
    const params = useParams();
    const isEdit = !!params?.id;
    const projectId = params?.id ? parseInt(params.id as string) : null;

    const { projects, customers, createProject, updateProject } = useProjects();
    const { employees } = useEmployees();

    const [formData, setFormData] = useState({
        project_code: '',
        project_name: '',
        description: '',
        client_id: '',
        start_date: '',
        end_date: '',
        status: 'active',
        supervised_by_id: '',
        developers: [] as string[],
        support_team: [] as string[],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit && projectId && projects.length > 0) {
            const project = projects.find(p => p.project_id === projectId);
            if (project) {
                setFormData({
                    project_code: project.project_code,
                    project_name: project.project_name,
                    description: project.description || '',
                    client_id: project.client_id?.toString() || '',
                    start_date: project.start_date || '',
                    end_date: project.end_date || '',
                    status: project.status,
                    supervised_by_id: project.supervised_by_id?.toString() || '',
                    developers: project.developers?.map(d => (typeof d === 'object' ? d.employee_id.toString() : d.toString())) || [],
                    support_team: project.support_team?.map(d => (typeof d === 'object' ? d.employee_id.toString() : d.toString())) || [],
                });
            }
        }
    }, [isEdit, projectId, projects]);

    const handleDeveloperToggle = (employeeId: string) => {
        setFormData(prev => ({
            ...prev,
            developers: prev.developers.includes(employeeId)
                ? prev.developers.filter(id => id !== employeeId)
                : [...prev.developers, employeeId]
        }));
    };

    const handleSupportToggle = (employeeId: string) => {
        setFormData(prev => ({
            ...prev,
            support_team: prev.support_team.includes(employeeId)
                ? prev.support_team.filter(id => id !== employeeId)
                : [...prev.support_team, employeeId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = {
            ...formData,
            client_id: formData.client_id ? parseInt(formData.client_id) : undefined,
            supervised_by_id: formData.supervised_by_id ? parseInt(formData.supervised_by_id) : undefined,
            developers: formData.developers.map(id => parseInt(id)),
            support_team: formData.support_team.map(id => parseInt(id)),
        };

        const result = isEdit && projectId
            ? await updateProject(projectId, data)
            : await createProject(data);

        if (result.success) {
            router.push('/projects');
        } else {
            setError(result.error || 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/projects" className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
                        ← Back to Projects
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Edit Project' : 'Create New Project'}
                    </h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Code *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.project_code}
                                onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="PRJ-001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer
                            </label>
                            <select
                                value={formData.client_id}
                                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Customer</option>
                                {customers.map(customer => (
                                    <option key={customer.customer_id} value={customer.customer_id}>{customer.customer_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.project_name}
                            onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter project name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter project description"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Supervised By (One Person)
                            </label>
                            <select
                                value={formData.supervised_by_id}
                                onChange={(e) => setFormData({ ...formData, supervised_by_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Supervisor</option>
                                {employees.map(emp => (
                                    <option key={emp.employee_id} value={emp.employee_id}>{emp.first_name} {emp.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status *
                            </label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="on_hold">On Hold</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Developed By (Team)
                            </label>
                            <div className="border border-gray-300 rounded-lg p-2 h-32 overflow-y-auto">
                                {employees.map(emp => (
                                    <div key={emp.employee_id} className="flex items-center mb-1">
                                        <input
                                            type="checkbox"
                                            id={`dev-${emp.employee_id}`}
                                            checked={formData.developers.includes(emp.employee_id.toString())}
                                            onChange={() => handleDeveloperToggle(emp.employee_id.toString())}
                                            className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`dev-${emp.employee_id}`} className="text-sm text-gray-700 select-none">
                                            {emp.first_name} {emp.last_name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Primary Support (Team)
                            </label>
                            <div className="border border-gray-300 rounded-lg p-2 h-32 overflow-y-auto">
                                {employees.map(emp => (
                                    <div key={emp.employee_id} className="flex items-center mb-1">
                                        <input
                                            type="checkbox"
                                            id={`supp-${emp.employee_id}`}
                                            checked={formData.support_team.includes(emp.employee_id.toString())}
                                            onChange={() => handleSupportToggle(emp.employee_id.toString())}
                                            className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`supp-${emp.employee_id}`} className="text-sm text-gray-700 select-none">
                                            {emp.first_name} {emp.last_name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Link
                            href="/projects"
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
