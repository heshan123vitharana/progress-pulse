import React from 'react';

interface ReportPreviewProps {
    type: 'daily' | 'tasks';
    data: any[];
    filters: {
        start_date?: string;
        end_date?: string;
        employee_id?: string;
        project_id?: string;
        status?: string;
    };
}

export default function ReportPreview({ type, data, filters }: ReportPreviewProps) {
    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 1: return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">Low</span>;
            case 2: return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">Medium</span>;
            case 3: return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs font-medium">High</span>;
            case 4: return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-xs font-medium">Urgent</span>;
            default: return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">Medium</span>;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="bg-white text-slate-900 border border-slate-200 shadow-sm p-8 min-h-[800px] w-full font-serif text-sm">
            {/* Report Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">Progress Pulse</h1>
                        <p className="text-slate-500 text-xs mt-1">INTERNAL REPORT</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold text-emerald-700">
                            {type === 'daily' ? 'Daily Task Report' : 'Task Summary Report'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Generated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Filter Summary */}
            <div className="bg-slate-50 p-4 rounded-lg mb-8 text-xs text-slate-600 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                    <span className="font-bold block text-slate-800 uppercase mb-1">Period</span>
                    <span className="text-red-600 font-semibold text-sm whitespace-nowrap">
                        {type === 'daily' || filters.start_date === filters.end_date
                            ? filters.start_date
                            : `${filters.start_date} to ${filters.end_date}`}
                    </span>
                </div>
                {filters.project_id && (
                    <div>
                        <span className="font-bold block text-slate-800 uppercase">Project ID</span>
                        {filters.project_id}
                    </div>
                )}
                {filters.employee_id && (
                    <div>
                        <span className="font-bold block text-slate-800 uppercase">Employee ID</span>
                        {filters.employee_id}
                    </div>
                )}
                {filters.status && (
                    <div>
                        <span className="font-bold block text-slate-800 uppercase">Status</span>
                        {filters.status}
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-300">
                            {type === 'daily' ? (
                                <>
                                    <th className="py-2 font-bold text-slate-700 w-20">Code</th>
                                    <th className="py-2 font-bold text-slate-700">Task Name</th>
                                    <th className="py-2 font-bold text-slate-700">Project</th>
                                    <th className="py-2 font-bold text-slate-700">Module</th>
                                    <th className="py-2 font-bold text-slate-700">Assigned To</th>
                                    <th className="py-2 font-bold text-slate-700 text-center w-24">Priority</th>
                                </>
                            ) : (
                                <>
                                    <th className="py-2 font-bold text-slate-700 w-20">Code</th>
                                    <th className="py-2 font-bold text-slate-700">Task Name</th>
                                    <th className="py-2 font-bold text-slate-700">Project</th>
                                    <th className="py-2 font-bold text-slate-700">Assigned To</th>
                                    <th className="py-2 font-bold text-slate-700">Status</th>
                                    <th className="py-2 font-bold text-slate-700 text-right w-24">Date</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    {type === 'daily' ? (
                                        <>
                                            <td className="py-3 pr-2 font-mono text-xs text-slate-500">{item.task_code || '-'}</td>
                                            <td className="py-3 pr-2 font-medium text-slate-800">{item.task_name}</td>
                                            <td className="py-3 pr-2 text-slate-600">{item.project_name || '-'}</td>
                                            <td className="py-3 pr-2 text-slate-600">{item.module_name || '-'}</td>
                                            <td className="py-3 pr-2 text-slate-600">{item.assigned_to || '-'}</td>
                                            <td className="py-3 text-center">{getPriorityLabel(item.priority || 2)}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-3 pr-2 font-mono text-xs text-slate-500">{item.task_code || '-'}</td>
                                            <td className="py-3 pr-2 font-medium text-slate-800">{item.task_name}</td>
                                            <td className="py-3 pr-2 text-slate-600">{item.project_name || '-'}</td>
                                            <td className="py-3 pr-2 text-slate-600">{item.assigned_to || '-'}</td>
                                            <td className="py-3 pr-2">
                                                <span className="capitalize px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                                                    {item.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-slate-500 font-mono text-xs">
                                                {formatDate(item.created_at)}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                                    No records found for the selected criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-12 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
                <p>Confidential - Internal Use Only</p>
                <p>Generated by Progress Pulse System</p>
            </div>
        </div>
    );
}
