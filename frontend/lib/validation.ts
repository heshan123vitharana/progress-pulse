import { z } from 'zod';

/**
 * Client-side validation schemas for time entries
 */

export const timeEntryValidation = {
    // Validate start time
    start_time: (value: string) => {
        if (!value) return 'Start time is required';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid start time format';
        if (date > new Date()) return 'Start time cannot be in the future';
        return null;
    },

    // Validate end time
    end_time: (startTime: string, endTime: string | null) => {
        if (!endTime) return null; // Optional

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(end.getTime())) return 'Invalid end time format';
        if (end <= start) return 'End time must be after start time';
        if (end > new Date()) return 'End time cannot be in the future';

        // Check for reasonable duration (< 24 hours)
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (duration > 24) return 'Duration cannot exceed 24 hours';

        return null;
    },

    // Validate description
    description: (value: string) => {
        if (value && value.length > 500) return 'Description must be less than 500 characters';
        return null;
    },

    // Validate complete time entry
    timeEntry: (data: {
        start_time: string;
        end_time?: string | null;
        description?: string;
        task_id?: number | null;
        project_id?: number | null;
    }) => {
        const errors: Record<string, string> = {};

        const startError = timeEntryValidation.start_time(data.start_time);
        if (startError) errors.start_time = startError;

        if (data.end_time) {
            const endError = timeEntryValidation.end_time(data.start_time, data.end_time);
            if (endError) errors.end_time = endError;
        }

        if (data.description) {
            const descError = timeEntryValidation.description(data.description);
            if (descError) errors.description = descError;
        }

        // At least one of task or project should be selected (business rule)
        if (!data.task_id && !data.project_id) {
            errors.general = 'Please select either a task or project';
        }

        return Object.keys(errors).length > 0 ? errors : null;
    }
};

/**
 * Real-time field validators for forms
 */
export const fieldValidators = {
    startTime: (value: string): string | null => {
        return timeEntryValidation.start_time(value);
    },

    endTime: (startTime: string, endTime: string): string | null => {
        return timeEntryValidation.end_time(startTime, endTime);
    },

    description: (value: string): string | null => {
        return timeEntryValidation.description(value);
    }
};

/**
 * Calculate duration between two times
 */
export function calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.floor((end.getTime() - start.getTime()) / 1000);
}

/**
 * Format duration in seconds to HH:MM:SS
 */
export function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format duration in seconds to readable format (e.g., "2h 30m")
 */
export function formatDurationReadable(seconds: number): string {
    if (!seconds) return '0m';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (h > 0) {
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${m}m`;
}
