'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useTimeTracking } from '@/hooks/use-time-tracking';

interface TimeTrackerProps {
    taskId: number;
}

export default function TaskTimeTracker({ taskId }: TimeTrackerProps) {
    const { activeTimer, startTimer, stopTimer, loading: hookLoading } = useTimeTracking();
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);

    const isTracking = activeTimer?.task_id === taskId;

    useEffect(() => {
        // Poll for total time specific to this task (legacy endpoint for stats)
        // Ideally this should be replaced by a stats endpoint, but keeping for now to preserve "Total Time" feature
        fetchTaskStats();

        let interval: NodeJS.Timeout;
        if (isTracking && activeTimer) {
            // Calculate session time locally based on start_time
            const start = new Date(activeTimer.start_time).getTime();
            interval = setInterval(() => {
                setCurrentSessionSeconds(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        } else {
            setCurrentSessionSeconds(0);
        }

        return () => clearInterval(interval);
    }, [taskId, isTracking, activeTimer]);

    const fetchTaskStats = async () => {
        try {
            const response = await api.get(`/tasks/${taskId}/time-tracking`);
            if (response.data.success) {
                setTotalSeconds(response.data.data.total_time_seconds);
            }
        } catch (error) {
            console.error('Error fetching task stats:', error);
        }
    };

    const handleSwitchOn = async () => {
        await startTimer(taskId);
    };

    const handleSwitchOff = async () => {
        await stopTimer();
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (hookLoading) {
        return <div>Loading time tracker...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Time Tracking</h3>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-600">Total Time</div>
                        <div className="text-3xl font-bold text-gray-800">
                            {formatTime(totalSeconds + (isTracking ? currentSessionSeconds : 0))}
                        </div>
                    </div>

                    {isTracking && (
                        <div>
                            <div className="text-sm text-gray-600">Current Session</div>
                            <div className="text-2xl font-semibold text-blue-600">
                                {formatTime(currentSessionSeconds)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    {!isTracking ? (
                        <button
                            onClick={handleSwitchOn}
                            disabled={!!activeTimer} // Disable if tracking another task
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${activeTimer
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {activeTimer ? 'Timer Active Elsewhere' : 'Start Tracking'}
                        </button>
                    ) : (
                        <button
                            onClick={handleSwitchOff}
                            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2 animate-pulse"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                            Stop Tracking
                        </button>
                    )}
                </div>

                {isTracking && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <span className="text-green-700 font-semibold">⏱️ Timer is running...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
