'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { TimeEntry } from '@/types';
import { retryWithBackoff, showError, showSuccess } from '@/lib/error-utils';

export function useTimeTracking() {
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTimeEntries = useCallback(async (startDate?: string, endDate?: string, employeeId?: string) => {
        try {
            setLoading(true);
            let url = '/time-entries';
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (employeeId) params.append('employee_id', employeeId);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await retryWithBackoff(() => api.get(url));
            const data = Array.isArray(res.data) ? res.data : res.data.data || [];
            setTimeEntries(data);
            setError('');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch time entries';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchActiveTimer = useCallback(async () => {
        try {
            const res = await api.get('/time-entries/active');
            setActiveTimer(res.data.data || null);
        } catch (err) {
            // Silently fail for active timer check
        }
    }, []);

    useEffect(() => {
        fetchTimeEntries();
        fetchActiveTimer();
    }, [fetchTimeEntries, fetchActiveTimer]);

    const startTimer = useCallback(async (
        taskId?: number,
        projectId?: number,
        description?: string
    ) => {
        try {
            const res = await api.post('/time-entries/start', {
                task_id: taskId,
                project_id: projectId,
                description
            });
            setActiveTimer(res.data.data);
            showSuccess('Timer started');
            return { success: true, data: res.data.data };
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to start timer';
            showError(message);
            return { success: false, error: message };
        }
    }, []);

    const stopTimer = useCallback(async (entryId?: string | number) => {
        const idToStop = entryId || activeTimer?.id;

        if (!idToStop) {
            showError('No active timer to stop');
            return { success: false, error: 'No active timer' };
        }

        // Optimistic update if we're stopping the "global" active timer
        const isStoppingActive = idToStop === activeTimer?.id;
        let previousTimer = activeTimer;

        if (isStoppingActive) {
            setActiveTimer(null);
        }

        try {
            const res = await api.post(`/time-entries/${idToStop}/stop`);
            await fetchTimeEntries(); // Refresh list
            await fetchActiveTimer(); // Sync status
            showSuccess('Timer stopped');
            return { success: true, data: res.data.data };
        } catch (err: any) {
            // Rollback on error
            if (isStoppingActive) {
                setActiveTimer(previousTimer);
            }
            const message = err.response?.data?.message || 'Failed to stop timer';
            showError(message);
            return { success: false, error: message };
        }
    }, [activeTimer, fetchTimeEntries, fetchActiveTimer]);

    const createTimeEntry = useCallback(async (data: Partial<TimeEntry>) => {
        try {
            const res = await api.post('/time-entries', data);
            await fetchTimeEntries(); // Refresh list
            showSuccess('Time entry created');
            return { success: true, data: res.data.data };
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to create time entry';
            showError(message);
            return { success: false, error: message };
        }
    }, [fetchTimeEntries]);

    const deleteTimeEntry = useCallback(async (id: number | string) => {
        // Optimistic update
        const previousEntries = [...timeEntries];
        setTimeEntries(prev => prev.filter(entry => entry.id !== id));

        try {
            await api.delete(`/time-entries/${id}`);
            showSuccess('Time entry deleted');
            return { success: true };
        } catch (err: any) {
            // Rollback on error
            setTimeEntries(previousEntries);
            const message = err.response?.data?.message || 'Failed to delete time entry';
            showError(message);
            return { success: false, error: message };
        }
    }, [timeEntries]);

    return {
        timeEntries,
        activeTimer,
        loading,
        error,
        startTimer,
        stopTimer,
        createTimeEntry,
        deleteTimeEntry,
        refetch: fetchTimeEntries
    };
}
