import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DashboardCounts } from '@/types';

export function useDashboard() {
    const [counts, setCounts] = useState<DashboardCounts | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardCounts();
    }, []);

    const fetchDashboardCounts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get<DashboardCounts>('/dashboard/counts');
            setCounts(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch dashboard data');
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        counts,
        loading,
        error,
        refetch: fetchDashboardCounts,
    };
}
