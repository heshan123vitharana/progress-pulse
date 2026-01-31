import React from 'react';
import Image from 'next/image';

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
    employeeName?: string;
}

export default function ReportPreview({ type, data, filters, employeeName }: ReportPreviewProps) {
    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 1: return <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold">Low</span>;
            case 2: return <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 text-[10px] font-semibold">Medium</span>;
            case 3: return <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-semibold">High</span>;
            case 4: return <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-semibold">Urgent</span>;
            default: return <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold">Medium</span>;
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: { label: string; color: string } } = {
            '1': { label: 'Created', color: 'bg-gray-100 text-gray-700' },
            '2': { label: 'In Progress', color: 'bg-black text-white' },
            '3': { label: 'QA', color: 'bg-gray-200 text-gray-800' },
            '4': { label: 'Repeat', color: 'bg-red-100 text-red-700' },
            '5': { label: 'Completed', color: 'bg-red-600 text-white' },
            '6': { label: 'Closed', color: 'bg-gray-300 text-gray-900' },
        };
        const info = statusMap[status] || { label: status || 'Pending', color: 'bg-gray-100 text-gray-700' };
        return <span className={`px-2 py-0.5 rounded ${info.color} text-[10px] font-semibold`}>{info.label}</span>;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatPeriod = () => {
        if (type === 'daily' || filters.start_date === filters.end_date) {
            return new Date(filters.start_date || '').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return `${formatDate(filters.start_date || '')} to ${formatDate(filters.end_date || '')}`;
    };

    return (
        <div className="bg-white text-slate-900 shadow-lg w-full max-w-[210mm] mx-auto" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Top Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-black via-red-600 to-black"></div>

            {/* Header - Compact & Professional */}
            <div className="px-8 pt-4 pb-3 border-b border-gray-200">
                <div className="flex justify-between items-start">
                    {/* Logo & Company Name */}
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 flex items-center justify-center">
                            <Image
                                src="/rbs-logo-new.png"
                                alt="RBS Logo"
                                width={56}
                                height={56}
                                className="object-contain"
                            />
                        </div>
                        <div className="origin-left transform scale-x-90">
                            <h1 className="text-lg font-bold text-black tracking-tighter leading-none whitespace-nowrap">RapidVenture Business Solutions</h1>
                            <p className="text-[10px] text-gray-600 mt-0.5">Project Management System</p>
                        </div>
                    </div>

                    {/* Report Info */}
                    <div className="text-right">
                        <div className="inline-block px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold uppercase mb-1">
                            Internal Report
                        </div>
                        <p className="text-[10px] text-gray-600">
                            Generated: <span className="font-semibold text-black">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </p>
                    </div>
                </div>

                {/* Report Title */}
                <h2 className="text-xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-black via-red-600 to-black">
                    {type === 'daily' ? 'Daily Task Report' : 'Task Summary Report'}
                </h2>
            </div>

            {/* Report Body */}
            <div className="px-8 py-3">
                {/* Filter Summary - Single Line Compact */}
                <div className="mb-3 bg-gray-50 rounded p-2.5 border border-gray-200">
                    <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-4">
                            <div>
                                <span className="font-bold text-gray-700 uppercase mr-1.5">Period:</span>
                                <span className="font-bold text-red-600">{formatPeriod()}</span>
                            </div>
                            {filters.project_id && (
                                <div>
                                    <span className="font-bold text-gray-700 uppercase mr-1.5">Project:</span>
                                    <span className="font-semibold text-black">#{filters.project_id}</span>
                                </div>
                            )}
                            {filters.employee_id && (
                                <div>
                                    <span className="font-bold text-gray-700 uppercase mr-1.5">Employee:</span>
                                    <span className="font-semibold text-black">{employeeName || `#${filters.employee_id}`}</span>
                                </div>
                            )}
                            {filters.status && (
                                <div>
                                    <span className="font-bold text-gray-700 uppercase mr-1.5">Status:</span>
                                    <span className="font-semibold text-black">{filters.status}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Data Table - Compact */}
                <div className="border border-gray-300 rounded">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white border-b-2 border-red-600">
                                {type === 'daily' ? (
                                    <>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase">Code</th>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase">Project</th>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase">Module</th>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase">Assigned To</th>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase text-center">Billable Hours</th>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase text-center">Priority</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase">Code</th>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase">Project</th>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase">Assigned To</th>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase">Status</th>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase text-center">Billable Hours</th>
                                        <th className="py-2 px-2.5 font-bold text-[10px] uppercase text-right">Date</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="text-[11px]">
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                    >
                                        {type === 'daily' ? (
                                            <>
                                                <td className="py-1.5 px-2.5 font-mono text-red-600 font-semibold whitespace-nowrap">{item.task_code || '-'}</td>
                                                <td className="py-1.5 px-2.5 text-gray-700">{item.project_name || '-'}</td>
                                                <td className="py-1.5 px-2.5 text-gray-700">{item.module_name || '-'}</td>
                                                <td className="py-1.5 px-2.5 text-gray-700">{item.assigned_to || '-'}</td>
                                                <td className="py-1.5 px-2.5 text-center font-mono text-gray-700">{item.billable_hours || '0.00'}</td>
                                                <td className="py-1.5 px-2.5 text-center">{getPriorityLabel(item.priority || 2)}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-1.5 px-2.5 font-mono text-red-600 font-semibold whitespace-nowrap">{item.task_code || '-'}</td>
                                                <td className="py-1.5 px-2.5 text-gray-700">{item.project_name || '-'}</td>
                                                <td className="py-1.5 px-2.5 text-gray-700">{item.assigned_to || '-'}</td>
                                                <td className="py-1.5 px-2.5">{getStatusLabel(item.status)}</td>
                                                <td className="py-1.5 px-2.5 text-center font-mono text-gray-700">{item.billable_hours || '0.00'}</td>
                                                <td className="py-1.5 px-2.5 text-right text-gray-600 whitespace-nowrap">
                                                    {formatDate(item.created_at)}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-gray-500 text-xs italic">
                                        No records found for the selected criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer - Single Line Compact */}
            <div className="mt-3 border-t border-gray-200 bg-gray-50 px-8 py-2">
                <div className="flex items-center justify-between text-[10px] text-gray-600">
                    <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-semibold text-black">Confidential - Internal Use Only</span>
                    </div>
                    <div>
                        Powered by <span className="font-bold text-red-600">RapidVenture Business Solutions</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
