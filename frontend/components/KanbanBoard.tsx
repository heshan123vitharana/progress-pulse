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
    { id: '1', label: 'Created', color: 'bg-blue-50' },
    { id: '2', label: 'In Progress', color: 'bg-yellow-50' },
    { id: '3', label: 'QA', color: 'bg-purple-50' },
    { id: '4', label: 'Repeat', color: 'bg-orange-50' },
    { id: '5', label: 'Completed', color: 'bg-green-50' },
    { id: '6', label: 'Closed', color: 'bg-gray-50' },
];

function SortableCard({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.task_id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
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
            <div className="flex gap-4 overflow-x-auto pb-4">
                {STATUSES.map(status => {
                    const statusTasks = tasks.filter(t => t.status === status.id);
                    return (
                        <div key={status.id} className="flex-shrink-0 w-80">
                            <div className={`${status.color} rounded-lg p-4`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-900">{status.label}</h3>
                                    <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">{statusTasks.length}</span>
                                </div>
                                <SortableContext items={statusTasks.map(t => t.task_id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-3 min-h-[200px]">
                                        {statusTasks.map(task => (
                                            <SortableCard key={task.task_id} task={task} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        </div>
                    );
                })}
            </div>
            <DragOverlay>{activeTask && <KanbanCard task={activeTask} />}</DragOverlay>
        </DndContext>
    );
}
