import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { showSuccess, showError } from '@/lib/error-utils';

interface UseTaskModalReturn {
    isOpen: boolean;
    taskId: number | null;
    openModal: (taskId: number) => void;
    closeModal: () => void;
    handlePickUp: (taskId: number) => Promise<void>;
    handleReject: (taskId: number) => Promise<void>;
    loading: boolean;
}

export function useTaskModal(): UseTaskModalReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [taskId, setTaskId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const openModal = (id: number) => {
        setTaskId(id);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => setTaskId(null), 300); // Clear after animation
    };

    const handlePickUp = async (id: number) => {
        if (loading) return;

        setLoading(true);
        try {
            // Accept the task
            await api.post(`/tasks/${id}/status`, { status: 'picked_up' });

            showSuccess('Task picked up successfully!');
            closeModal();

            // Redirect to timesheet with the task ID
            router.push(`/timesheet?picked_task=${id}`);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to pick up task');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (id: number) => {
        if (loading) return;

        setLoading(true);
        try {
            // Reject the task - this will notify the creator
            await api.post(`/tasks/${id}/reject`);

            showSuccess('Task assignment declined');
            closeModal();

            // Redirect to tasks page
            router.push('/tasks');
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to decline task');
        } finally {
            setLoading(false);
        }
    };

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeModal();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return {
        isOpen,
        taskId,
        openModal,
        closeModal,
        handlePickUp,
        handleReject,
        loading,
    };
}
