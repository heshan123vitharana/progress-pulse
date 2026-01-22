import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Department } from '@/types';

export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/departments');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            // Map backend response to frontend interface
            const mappedData = data.map((d: any) => ({
                department_id: d.department_id,
                department_name: d.department_name || d.department,
                description: d.description || '',
                status: d.status || 'active'
            }));
            setDepartments(mappedData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch departments');
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    const createDepartment = async (data: Partial<Department>) => {
        try {
            await api.post('/departments', data);
            await fetchDepartments();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to create department' };
        }
    };

    const updateDepartment = async (department_id: number, data: Partial<Department>) => {
        try {
            await api.put(`/departments/${department_id}`, data);
            await fetchDepartments();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to update department' };
        }
    };

    const deleteDepartment = async (department_id: number) => {
        try {
            await api.delete(`/departments/${department_id}`);
            await fetchDepartments();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete department' };
        }
    };

    return {
        departments,
        loading,
        error,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        refetch: fetchDepartments,
    };
}
