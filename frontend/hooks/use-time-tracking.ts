'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { TimeEntry } from '@/types';

export function useTimeTracking() {
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTimeEntries();
        fetchActiveTimer();
    }, []);

    const fetchTimeEntries = async () => {
        try {
            setLoading(true);
            const res = await api.get('/time-entries');
            setTimeEntries(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch time entries');
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveTimer = async () => {
        try {
            const res = await api.get('/time-entries/active');
            setActiveTimer(res.data.data || null);
        } catch (err) { }
    };

    const startTimer = async (taskId?: number, projectId?: number, description?: string) => {
        try {
            const res = await api.post('/time-entries/start', { task_id: taskId, project_id: projectId, description });
            setActiveTimer(res.data.data); // API returns { success: true, data: ... }
            return { success: true, data: res.data.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to start timer' };
        }
    };

    const stopTimer = async () => {
        if (!activeTimer) return { success: false, error: 'No active timer' };
        try {
            const res = await api.post(`/time-entries/${activeTimer.id}/stop`);
            setActiveTimer(null);
            await fetchTimeEntries();
            return { success: true, data: res.data.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to stop timer' };
        }
    };

    const createTimeEntry = async (data: Partial<TimeEntry>) => {
        try {
            const res = await api.post('/time-entries', data);
            await fetchTimeEntries();
            return { success: true, data: res.data.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to create time entry' };
        }
    };

    const deleteTimeEntry = async (id: number) => {
        try {
            await api.delete(`/time-entries/${id}`);
            await fetchTimeEntries();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete time entry' };
        }
    };

    return { timeEntries, activeTimer, loading, error, startTimer, stopTimer, createTimeEntry, deleteTimeEntry, fetchTimeEntries };
}
