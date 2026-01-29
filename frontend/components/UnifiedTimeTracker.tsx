'use client';

import { useState, useEffect } from 'react';
import { useTimeEntryStore } from '@/store/time-entry-store';
import { formatDuration } from '@/lib/validation';

interface UnifiedTimeTrackerProps {
    taskId?: number;
    projectId?: number;
    variant?: 'compact' | 'full';
    showStats?: boolean;
}

export default function UnifiedTimeTracker({
    taskId,
    projectId,
    variant = 'compact',
    showStats = false
}: UnifiedTimeTrackerProps) {
    const { activeTimer, startTimer, stopTimer, syncing } = useTimeEntryStore();
    const [elapsed, setElapsed] = useState(0);

    // Check if this component's timer is active
    const isActiveForThis = activeTimer &&
        (!taskId || activeTimer.task_id === taskId) &&
        (!projectId || activeTimer.project_id === projectId);

    // Update elapsed time every second
    useEffect(() => {
        if (!activeTimer) {
            setElapsed(0);
            return;
        }

        const startTime = new Date(activeTimer.start_time).getTime();
        const updateElapsed = () => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        };

        updateElapsed(); // Initial calculation
        const interval = setInterval(updateElapsed, 1000);

        return () => clearInterval(interval);
    }, [activeTimer]);

    const handleStart = async () => {
        await startTimer(taskId, projectId);
    };

    const handleStop = async () => {
        await stopTimer();
    };

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-3">
                {/* Timer Display */}
                <div className={`font-mono text-lg font-bold ${isActiveForThis ? 'text-green-600' : 'text-slate-400'
                    }`}>
                    {formatDuration(elapsed)}
                </div>

                {/* Control Button */}
                {isActiveForThis ? (
                    <button
                        onClick={handleStop}
                        disabled={syncing}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Stop Timer"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <rect x="6" y="6" width="8" height="8" rx="1" />
                        </svg>
                    </button>
                ) : (
                    <button
                        onClick={handleStart}
                        disabled={!!activeTimer || syncing}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeTimer
                                ? 'bg-slate-200 text-slate-400'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                        title={activeTimer ? 'Another timer is running' : 'Start Timer'}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                    </button>
                )}

                {/* Sync Indicator */}
                {syncing && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Syncing..." />
                )}
            </div>
        );
    }

    // Full variant with stats
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Time Tracking
                </h3>
                {syncing && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        Syncing...
                    </span>
                )}
            </div>

            {/* Timer Display */}
            <div className="text-center mb-6">
                <div className={`text-5xl font-mono font-bold mb-2 ${isActiveForThis ? 'text-green-600' : 'text-slate-400'
                    }`}>
                    {formatDuration(elapsed)}
                </div>
                {isActiveForThis && (
                    <div className="text-sm text-green-600 font-medium">⏱️ Timer Running</div>
                )}
                {activeTimer && !isActiveForThis && (
                    <div className="text-sm text-amber-600 font-medium">
                        ⚠️ Another task timer is active
                    </div>
                )}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
                {isActiveForThis ? (
                    <button
                        onClick={handleStop}
                        disabled={syncing}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-pulse"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <rect x="6" y="6" width="8" height="8" rx="1" />
                        </svg>
                        Stop Tracking
                    </button>
                ) : (
                    <button
                        onClick={handleStart}
                        disabled={!!activeTimer || syncing}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${activeTimer
                                ? 'bg-slate-200 text-slate-500'
                                : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/25'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        {activeTimer ? 'Timer Active Elsewhere' : 'Start Tracking'}
                    </button>
                )}
            </div>

            {/* Session Info */}
            {isActiveForThis && activeTimer && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-xs text-green-700 space-y-1">
                        <div>
                            <span className="font-medium">Started:</span>{' '}
                            {new Date(activeTimer.start_time).toLocaleTimeString()}
                        </div>
                        {activeTimer.description && (
                            <div>
                                <span className="font-medium">Note:</span> {activeTimer.description}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
