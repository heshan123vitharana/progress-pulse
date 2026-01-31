'use client';
import { useState, useEffect } from 'react';
import { useTimeTracking } from '@/hooks/use-time-tracking';

export default function TimeTracker({ taskId, projectId }: { taskId?: number; projectId?: number }) {
    const { activeTimer, startTimer, stopTimer } = useTimeTracking();
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!activeTimer) {
            setElapsed(0);
            return;
        }
        const start = new Date(activeTimer.start_time).getTime();
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeTimer]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = async () => {
        await startTimer(taskId, projectId);
    };

    const handleStop = async () => {
        await stopTimer();
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-2xl font-mono font-bold text-gray-900">{formatTime(elapsed)}</div>
            <a
                href="/timesheet"
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition flex items-center gap-2"
                title="Manage in Timesheet"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Track in Timesheet
            </a>
        </div>
    );
}
