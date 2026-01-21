import { Task } from '@/types';

interface KanbanCardProps {
    task: Task;
}

export default function KanbanCard({ task }: KanbanCardProps) {
    const priorityColors = {
        1: 'border-l-4 border-red-500',
        2: 'border-l-4 border-yellow-500',
        3: 'border-l-4 border-green-500',
    };

    const isOverdue = task.end_date && new Date(task.end_date) < new Date() && !['5', '6'].includes(task.status);

    // Base priority colors
    const startColor = isOverdue ? 'border-l-4 border-red-600 bg-red-50' : (priorityColors[task.priority as keyof typeof priorityColors] || '');

    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-move ${startColor}`}>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{task.task_name}</h4>
                <span className="text-xs text-gray-500">{task.task_code}</span>
            </div>
            {task.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {task.employee && (
                        <div className="flex items-center gap-1">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                {task.employee.first_name.charAt(0)}
                            </div>
                            <span className="text-xs text-gray-600">{task.employee.first_name}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {task.priority === 1 && <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">High</span>}
                    {task.priority === 2 && <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Med</span>}
                    {task.priority === 3 && <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Low</span>}
                </div>
            </div>
            {isOverdue && (
                <div className="mt-2 pt-2 border-t border-red-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-red-600">Overdue</span>
                    <span className="text-xs text-red-500">
                        {Math.ceil(Math.abs(new Date(task.end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                </div>
            )}
        </div>
    );
}
