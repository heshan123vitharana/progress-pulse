import { Task } from '@/types';
import Link from 'next/link';

interface KanbanCardProps {
    task: Task;
}

export default function KanbanCard({ task }: KanbanCardProps) {
    const priorityStyles = {
        1: { border: 'border-l-4 border-l-rose-500', badge: 'bg-rose-100 text-rose-700', label: 'Critical' },
        2: { border: 'border-l-4 border-l-orange-500', badge: 'bg-orange-100 text-orange-700', label: 'High' },
        3: { border: 'border-l-4 border-l-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Medium' },
        4: { border: 'border-l-4 border-l-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'Low' },
    };

    const isOverdue = task.end_date && new Date(task.end_date) < new Date() && !['5', '6'].includes(task.status);
    const priority = priorityStyles[task.priority as keyof typeof priorityStyles] || priorityStyles[3];

    const cardStyle = isOverdue
        ? 'border-l-4 border-l-rose-500 bg-rose-50/50'
        : priority.border;

    return (
        <div className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing ${cardStyle} overflow-hidden group`}>
            <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <Link
                        href={`/tasks/${task.task_id}/details`}
                        className="font-semibold text-sm text-slate-800 hover:text-violet-600 transition-colors line-clamp-2 flex-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {task.task_name}
                    </Link>
                    <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                        {task.task_code}
                    </span>
                </div>

                {/* Description */}
                {task.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                )}

                {/* Project */}
                {task.project && (
                    <div className="flex items-center text-xs text-slate-500 mb-3">
                        <svg className="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {task.project.project_name}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    {/* Assignee */}
                    <div className="flex items-center gap-2">
                        {task.employee ? (
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                    {task.employee.first_name.charAt(0)}
                                </div>
                                <span className="text-xs text-slate-600">{task.employee.first_name}</span>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                    </div>

                    {/* Priority Badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.badge}`}>
                        {priority.label}
                    </span>
                </div>

                {/* Overdue Warning */}
                {isOverdue && (
                    <div className="mt-3 pt-2 border-t border-rose-200 flex items-center justify-between">
                        <div className="flex items-center text-rose-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-semibold">Overdue</span>
                        </div>
                        <span className="text-xs text-rose-500 font-medium">
                            {Math.ceil(Math.abs(new Date(task.end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
