import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Designation } from '@/types';

export function useDesignations() {
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDesignations();
    }, []);

    const fetchDesignations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/designations');
            const rawData = Array.isArray(response.data) ? response.data : (response.data.data || []);
            // Map backend data to frontend interface
            const data: Designation[] = rawData.map((item: any) => ({
                id: item.designation_id || item.id, // Handle mismatch if any
                designation_name: item.designation || item.designation_name,
                description: item.description,
                status: item.status,
                created_at: item.created_at,
                updated_at: item.updated_at
            }));

            setDesignations(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch designations');
            setDesignations([]);
        } finally {
            setLoading(false);
        }
    };

    const createDesignation = async (data: Partial<Designation>) => {
        try {
            await api.post('/designations', data);
            await fetchDesignations();
            return { success: true };
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to create designation';
            const validationErrors = err.response?.data?.errors;
            return { success: false, error: errorMessage, validationErrors };
        }
    };

    const updateDesignation = async (id: number, data: Partial<Designation>) => {
        try {
            await api.put(`/designations/${id}`, data);
            await fetchDesignations();
            return { success: true };
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update designation';
            const validationErrors = err.response?.data?.errors;
            return { success: false, error: errorMessage, validationErrors };
        }
    };

    const deleteDesignation = async (id: number) => {
        try {
            await api.delete(`/designations/${id}`);
            await fetchDesignations();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete designation' };
        }
    };

    return {
        designations,
        loading,
        error,
        createDesignation,
        updateDesignation,
        deleteDesignation,
        refetch: fetchDesignations,
    };
}
