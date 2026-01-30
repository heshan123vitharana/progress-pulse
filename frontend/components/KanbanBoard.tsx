'use client';
import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import KanbanCard from './KanbanCard';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskMove: (taskId: number, newStatus: string) => void;
}

const STATUSES = [
    { id: '1', label: 'Assigned', color: 'from-slate-500 to-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
    { id: '2', label: 'Accept', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: '3', label: 'In-Progress', color: 'from-yellow-500 to-amber-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { id: '4', label: 'In-QA', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { id: '5', label: 'QA-In-Progress', color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
    { id: '6', label: 'In-Repeating', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { id: '7', label: 'In-Test Server', color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
    { id: '8', label: 'Completed', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
];

function SortableCard({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.task_id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 1
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <KanbanCard task={task} />
        </div>
    );
}

export default function KanbanBoard({ tasks, onTaskMove }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.task_id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const taskId = active.id as number;
            const newStatus = over.id as string;
            onTaskMove(taskId, newStatus);
        }
        setActiveTask(null);
    };

    return (
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {STATUSES.map(status => {
                    const statusTasks = tasks.filter(t => t.status === status.id);
                    return (
                        <div key={status.id} className="flex-shrink-0 w-80">
                            <div className={`rounded-2xl ${status.bgColor} border ${status.borderColor} overflow-hidden shadow-sm`}>
                                {/* Column Header */}
                                <div className={`px-4 py-3 bg-gradient-to-r ${status.color}`}>
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-white">{status.label}</h3>
                                        <span className="text-sm bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full font-medium">
                                            {statusTasks.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Column Content */}
                                <div className="p-3">
                                    <SortableContext items={statusTasks.map(t => t.task_id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-3 min-h-[250px]">
                                            {statusTasks.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                                    <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <p className="text-sm">No tasks</p>
                                                </div>
                                            ) : (
                                                statusTasks.map(task => (
                                                    <SortableCard key={task.task_id} task={task} />
                                                ))
                                            )}
                                        </div>
                                    </SortableContext>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <DragOverlay>
                {activeTask && (
                    <div className="rotate-3 scale-105">
                        <KanbanCard task={activeTask} />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
