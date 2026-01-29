import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';
import { showError, showSuccess, retryWithBackoff } from '@/lib/error-utils';
import { TimeEntry } from '@/types';

interface PendingOperation {
    id: string;
    type: 'start' | 'stop' | 'create' | 'delete' | 'update';
    data: any;
    timestamp: number;
    retries: number;
}

interface TimeEntryState {
    // State
    timeEntries: TimeEntry[];
    activeTimer: TimeEntry | null;
    loading: boolean;
    syncing: boolean;
    pendingOperations: PendingOperation[];

    // Computed
    totalHours: number;
    billableHours: number;

    // Actions
    fetchTimeEntries: () => Promise<void>;
    fetchActiveTimer: () => Promise<void>;
    startTimer: (taskId?: number, projectId?: number, description?: string) => Promise<{ success: boolean; error?: string }>;
    stopTimer: () => Promise<{ success: boolean; error?: string }>;
    createTimeEntry: (data: Partial<TimeEntry>) => Promise<{ success: boolean; error?: string }>;
    updateTimeEntry: (id: number | string, data: Partial<TimeEntry>) => Promise<{ success: boolean; error?: string }>;
    deleteTimeEntry: (id: number | string) => Promise<{ success: boolean; error?: string }>;
    syncPendingOperations: () => Promise<void>;

    // Internal
    _addPendingOperation: (op: Omit<PendingOperation, 'id' | 'retries' | 'timestamp'>) => void;
    _removePendingOperation: (id: string) => void;
    _updateActiveTimer: (timer: TimeEntry | null) => void;
}

export const useTimeEntryStore = create<TimeEntryState>()(
    persist(
        (set, get) => ({
            // Initial State
            timeEntries: [],
            activeTimer: null,
            loading: false,
            syncing: false,
            pendingOperations: [],
            totalHours: 0,
            billableHours: 0,

            // Fetch all time entries
            fetchTimeEntries: async () => {
                try {
                    set({ loading: true });
                    const res = await retryWithBackoff(() => api.get('/time-entries'));
                    const entries = Array.isArray(res.data) ? res.data : res.data.data || [];

                    // Calculate computed values
                    const totalHours = entries.reduce((sum: number, e: TimeEntry) => sum + (e.duration || 0), 0) / 3600;
                    const billableHours = entries
                        .filter((e: TimeEntry) => e.is_billable)
                        .reduce((sum: number, e: TimeEntry) => sum + (e.duration || 0), 0) / 3600;

                    set({ timeEntries: entries, totalHours, billableHours, loading: false });
                } catch (error) {
                    set({ loading: false });
                    showError(error);
                }
            },

            // Fetch active timer
            fetchActiveTimer: async () => {
                try {
                    const res = await api.get('/time-entries/active');
                    set({ activeTimer: res.data.data || null });
                } catch (error) {
                    // Silently fail for active timer check
                }
            },

            // Start timer with optimistic update
            startTimer: async (taskId?, projectId?, description?) => {
                const tempTimer: TimeEntry = {
                    id: `temp-${Date.now()}`,
                    user_id: 'current',
                    task_id: taskId,
                    project_id: projectId,
                    description,
                    start_time: new Date().toISOString(),
                    end_time: null,
                    duration: 0,
                    status: 'running',
                    is_billable: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as TimeEntry;

                // Optimistic update
                set({ activeTimer: tempTimer });

                try {
                    const res = await api.post('/time-entries/start', {
                        task_id: taskId,
                        project_id: projectId,
                        description
                    });

                    set({ activeTimer: res.data.data });
                    showSuccess('Timer started');
                    return { success: true };
                } catch (error: any) {
                    // Rollback on error
                    set({ activeTimer: null });

                    // Queue for offline sync
                    if (!navigator.onLine) {
                        get()._addPendingOperation({
                            type: 'start',
                            data: { task_id: taskId, project_id: projectId, description }
                        });
                        showSuccess('Timer saved offline. Will sync when online.');
                        return { success: true };
                    }

                    showError(error);
                    return { success: false, error: error.response?.data?.message || 'Failed to start timer' };
                }
            },

            // Stop timer with optimistic update
            stopTimer: async () => {
                const { activeTimer } = get();
                if (!activeTimer) {
                    showError('No active timer');
                    return { success: false, error: 'No active timer' };
                }

                const previousTimer = activeTimer;

                // Optimistic update
                set({ activeTimer: null });

                try {
                    const res = await api.post(`/time-entries/${activeTimer.id}/stop`);

                    // Add stopped entry to list
                    const entries = [res.data.data, ...get().timeEntries];
                    const totalHours = entries.reduce((sum, e) => sum + (e.duration || 0), 0) / 3600;
                    const billableHours = entries
                        .filter(e => e.is_billable)
                        .reduce((sum, e) => sum + (e.duration || 0), 0) / 3600;

                    set({ timeEntries: entries, totalHours, billableHours });
                    showSuccess('Timer stopped');
                    return { success: true };
                } catch (error: any) {
                    // Rollback on error
                    set({ activeTimer: previousTimer });

                    if (!navigator.onLine) {
                        get()._addPendingOperation({
                            type: 'stop',
                            data: { id: activeTimer.id }
                        });
                        showSuccess('Saved offline. Will sync when online.');
                        return { success: true };
                    }

                    showError(error);
                    return { success: false, error: error.response?.data?.message || 'Failed to stop timer' };
                }
            },

            // Create time entry with optimistic update
            createTimeEntry: async (data) => {
                const tempEntry: TimeEntry = {
                    ...data,
                    id: `temp-${Date.now()}`,
                    user_id: 'current',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as TimeEntry;

                // Optimistic update
                set(state => ({ timeEntries: [tempEntry, ...state.timeEntries] }));

                try {
                    const res = await api.post('/time-entries', data);

                    // Replace temp with real entry
                    set(state => ({
                        timeEntries: state.timeEntries.map(e =>
                            e.id === tempEntry.id ? res.data.data : e
                        )
                    }));

                    showSuccess('Time entry created');
                    return { success: true };
                } catch (error: any) {
                    // Rollback on error
                    set(state => ({
                        timeEntries: state.timeEntries.filter(e => e.id !== tempEntry.id)
                    }));

                    if (!navigator.onLine) {
                        get()._addPendingOperation({ type: 'create', data });
                        showSuccess('Saved offline. Will sync when online.');
                        return { success: true };
                    }

                    showError(error);
                    return { success: false, error: error.response?.data?.message || 'Failed to create entry' };
                }
            },

            // Update time entry
            updateTimeEntry: async (id, data) => {
                try {
                    await api.put(`/time-entries/${id}`, data);
                    await get().fetchTimeEntries();
                    showSuccess('Time entry updated');
                    return { success: true };
                } catch (error: any) {
                    showError(error);
                    return { success: false, error: error.response?.data?.message || 'Failed to update entry' };
                }
            },

            // Delete time entry with optimistic update
            deleteTimeEntry: async (id) => {
                const previousEntries = [...get().timeEntries];

                // Optimistic update
                set(state => ({
                    timeEntries: state.timeEntries.filter(e => e.id !== id)
                }));

                try {
                    await api.delete(`/time-entries/${id}`);
                    showSuccess('Time entry deleted');
                    return { success: true };
                } catch (error: any) {
                    // Rollback on error
                    set({ timeEntries: previousEntries });
                    showError(error);
                    return { success: false, error: error.response?.data?.message || 'Failed to delete entry' };
                }
            },

            // Sync pending operations
            syncPendingOperations: async () => {
                const { pendingOperations } = get();
                if (pendingOperations.length === 0) return;

                set({ syncing: true });

                for (const op of pendingOperations) {
                    try {
                        // Execute operation based on type
                        switch (op.type) {
                            case 'start':
                                await api.post('/time-entries/start', op.data);
                                break;
                            case 'stop':
                                await api.post(`/time-entries/${op.data.id}/stop`);
                                break;
                            case 'create':
                                await api.post('/time-entries', op.data);
                                break;
                            case 'delete':
                                await api.delete(`/time-entries/${op.data.id}`);
                                break;
                        }

                        get()._removePendingOperation(op.id);
                    } catch (error) {
                        // Keep in queue if failed
                        console.error('Failed to sync operation:', op, error);
                    }
                }

                set({ syncing: false });
                await get().fetchTimeEntries();
                await get().fetchActiveTimer();
            },

            // Internal: Add pending operation
            _addPendingOperation: (op) => {
                set(state => ({
                    pendingOperations: [
                        ...state.pendingOperations,
                        {
                            ...op,
                            id: `${op.type}-${Date.now()}`,
                            timestamp: Date.now(),
                            retries: 0
                        }
                    ]
                }));
            },

            // Internal: Remove pending operation
            _removePendingOperation: (id) => {
                set(state => ({
                    pendingOperations: state.pendingOperations.filter(op => op.id !== id)
                }));
            },

            // Internal: Update active timer
            _updateActiveTimer: (timer) => {
                set({ activeTimer: timer });
            },
        }),
        {
            name: 'time-entry-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                pendingOperations: state.pendingOperations,
                // Don't persist activeTimer (fetch fresh on load)
            }),
        }
    )
);

// Sync when coming back online
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        useTimeEntryStore.getState().syncPendingOperations();
    });
}
