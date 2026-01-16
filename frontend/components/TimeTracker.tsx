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
            {activeTimer ? (
                <button onClick={handleStop} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <rect x="6" y="6" width="8" height="8" />
                    </svg>
                </button>
            ) : (
                <button onClick={handleStart} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                </button>
            )}
        </div>
    );
}
