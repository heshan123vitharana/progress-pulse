import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Customer } from '@/types';

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/customers');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setCustomers(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch customers');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const createCustomer = async (data: Partial<Customer>) => {
        try {
            await api.post('/customers', data);
            await fetchCustomers();
            return { success: true };
        } catch (err: any) {
            console.error('Create customer error:', err);
            const message = err.response?.data?.message || 'Failed to create customer';
            const errors = err.response?.data?.errors ? '\n' + JSON.stringify(err.response.data.errors, null, 2) : '';
            return { success: false, error: message + errors };
        }
    };

    const updateCustomer = async (customer_id: number, data: Partial<Customer>) => {
        try {
            await api.put(`/customers/${customer_id}`, data);
            await fetchCustomers();
            return { success: true };
        } catch (err: any) {
            console.error('Update customer error:', err);
            const message = err.response?.data?.message || 'Failed to update customer';
            const errors = err.response?.data?.errors ? '\n' + JSON.stringify(err.response.data.errors, null, 2) : '';
            return { success: false, error: message + errors };
        }
    };

    const deleteCustomer = async (id: number) => {
        try {
            await api.delete(`/customers/${id}`);
            await fetchCustomers();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete customer' };
        }
    };

    return {
        customers,
        loading,
        error,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        refetch: fetchCustomers,
    };
}
