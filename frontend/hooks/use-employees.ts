import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Employee, Department, Designation } from '@/types';

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
        fetchDesignations();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await api.get('/employees');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setEmployees(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch employees');
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/departments');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setDepartments(data);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
            setDepartments([]);
        }
    };

    const fetchDesignations = async () => {
        try {
            const response = await api.get('/designations');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setDesignations(data);
        } catch (err) {
            console.error('Failed to fetch designations:', err);
            setDesignations([]);
        }
    };

    const createEmployee = async (data: Partial<Employee>) => {
        try {
            await api.post('/employees', data);
            await fetchEmployees();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to create employee' };
        }
    };

    const updateEmployee = async (employee_id: number, data: Partial<Employee>) => {
        try {
            await api.put(`/employees/${employee_id}`, data);
            await fetchEmployees();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to update employee' };
        }
    };

    const deleteEmployee = async (employee_id: number) => {
        try {
            await api.delete(`/employees/${employee_id}`);
            await fetchEmployees();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete employee' };
        }
    };

    return {
        employees,
        departments,
        designations,
        loading,
        error,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        refetch: fetchEmployees,
    };
}
