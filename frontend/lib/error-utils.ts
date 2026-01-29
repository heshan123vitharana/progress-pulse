import { toast } from 'react-hot-toast';

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (error && typeof error === 'object') {
        // Axios error
        if ('response' in error) {
            const axiosError = error as any;
            return axiosError.response?.data?.message ||
                axiosError.response?.data?.error ||
                axiosError.message ||
                'Request failed';
        }

        // Generic error object
        if ('message' in error) {
            return String(error.message);
        }
    }

    return 'An unexpected error occurred';
}

/**
 * Show error toast notification
 */
export function showError(error: unknown) {
    const message = getErrorMessage(error);
    toast.error(message);
}

/**
 * Show success toast notification
 */
export function showSuccess(message: string) {
    toast.success(message);
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on client errors (4xx)
            if (error && typeof error === 'object' && 'response' in error) {
                const status = (error as any).response?.status;
                if (status >= 400 && status < 500) {
                    throw error;
                }
            }

            if (i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}
