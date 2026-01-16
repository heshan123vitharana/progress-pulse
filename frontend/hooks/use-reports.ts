import { useState } from 'react';
import api from '@/lib/api';

interface ReportFilters {
    start_date?: string;
    end_date?: string;
    employee_id?: number;
    project_id?: number;
    status?: string;
}

export function useReports() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateDailyReport = async (filters: ReportFilters) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/reports/daily-tasks', { params: filters });
            return { success: true, data: response.data };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to generate report';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const generateTaskReport = async (filters: ReportFilters) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/reports/tasks', { params: filters });
            return { success: true, data: response.data };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to generate report';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (type: 'daily' | 'tasks', filters: ReportFilters) => {
        try {
            setLoading(true);
            const endpoint = type === 'daily' ? '/reports/daily-tasks/export' : '/reports/tasks/export';
            const response = await api.get(endpoint, {
                params: filters,
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            return { success: true };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to export report';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        generateDailyReport,
        generateTaskReport,
        exportReport,
    };
}
