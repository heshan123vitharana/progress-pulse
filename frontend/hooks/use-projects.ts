import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Project, Customer } from '@/types';

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
        fetchCustomers();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await api.get('/projects');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setProjects(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch projects');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setCustomers(data);
        } catch (err) {
            console.error('Failed to fetch customers:', err);
            setCustomers([]);
        }
    };

    const createProject = async (data: Partial<Project>) => {
        try {
            await api.post('/projects', data);
            await fetchProjects();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to create project' };
        }
    };

    const updateProject = async (project_id: number, data: Partial<Project>) => {
        try {
            await api.put(`/projects/${project_id}`, data);
            await fetchProjects();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to update project' };
        }
    };

    const deleteProject = async (id: number) => {
        try {
            await api.delete(`/projects/${id}`);
            await fetchProjects();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete project' };
        }
    };

    return {
        projects,
        customers,
        loading,
        error,
        createProject,
        updateProject,
        deleteProject,
        refetch: fetchProjects,
    };
}
