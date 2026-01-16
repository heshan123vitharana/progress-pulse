import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { User } from '@/types';

interface Role {
    id: number;
    name: string;
    description?: string;
}

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setUsers(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setRoles(data);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
            setRoles([]);
        }
    };

    const createUser = async (data: Partial<User> & { password: string }) => {
        try {
            await api.post('/users', data);
            await fetchUsers();
            return { success: true };
        } catch (err: any) {
            console.error('Create user error:', err);
            const message = err.response?.data?.message || 'Failed to create user';
            const errors = err.response?.data?.errors ? '\n' + JSON.stringify(err.response.data.errors, null, 2) : '';
            return { success: false, error: message + errors };
        }
    };

    const updateUser = async (id: number, data: Partial<User>) => {
        try {
            await api.put(`/users/${id}`, data);
            await fetchUsers();
            return { success: true };
        } catch (err: any) {
            console.error('Update user error:', err);
            const message = err.response?.data?.message || 'Failed to update user';
            const errors = err.response?.data?.errors ? '\n' + JSON.stringify(err.response.data.errors, null, 2) : '';
            return { success: false, error: message + errors };
        }
    };

    const deleteUser = async (id: number) => {
        try {
            await api.delete(`/users/${id}`);
            await fetchUsers();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete user' };
        }
    };

    return {
        users,
        roles,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        refetch: fetchUsers,
    };
}
