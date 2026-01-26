'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReports } from '@/hooks/use-reports';
import { useEmployees } from '@/hooks/use-employees';
import { useProjects } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import BackButton from '@/components/ui/BackButton';

const TASK_STATUSES = [
    { value: '', label: 'All Statuses' },
    { value: '1', label: 'Created' },
    { value: '2', label: 'In Progress' },
    { value: '3', label: 'QA' },
    { value: '4', label: 'Repeat' },
    { value: '5', label: 'Completed' },
    { value: '6', label: 'Closed' },
];

export default function ReportsPage() {
    const { generateDailyReport, generateTaskReport, exportReport, loading } = useReports();
    const { employees } = useEmployees();
    const { projects } = useProjects();
    const { tasks } = useTasks();

    const [reportType, setReportType] = useState<'daily' | 'tasks'>('daily');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        start_date: today,
        end_date: today,
        employee_id: '',
        project_id: '',
        status: '',
    });
    const [reportData, setReportData] = useState<any>(null);

    const handleGenerateReport = async () => {
        const filterParams = {
            ...filters,
            employee_id: filters.employee_id ? parseInt(filters.employee_id) : undefined,
            project_id: filters.project_id ? parseInt(filters.project_id) : undefined,
        };

        const result = reportType === 'daily'
            ? await generateDailyReport(filterParams)
            : await generateTaskReport(filterParams);

        if (result.success) {
            setReportData(result.data);
        }
    };

    const handleExport = async () => {
        const filterParams = {
            ...filters,
            employee_id: filters.employee_id ? parseInt(filters.employee_id) : undefined,
            project_id: filters.project_id ? parseInt(filters.project_id) : undefined,
        };

        await exportReport(reportType, filterParams);
    };

    // Remove debug logs

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <BackButton />
                </div>
            </header>


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] overflow-y-auto">
                {/* Report Type Selection */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setReportType('daily');
                                // Reset to today when switching to daily
                                setFilters(prev => ({ ...prev, start_date: today, end_date: today }));
                            }}
                            className={`px-6 py-3 rounded-lg font-medium transition ${reportType === 'daily'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Daily Task Report
                        </button>
                        <button
                            onClick={() => setReportType('tasks')}
                            className={`px-6 py-3 rounded-lg font-medium transition ${reportType === 'tasks'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Task Summary Report
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {reportType === 'daily' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={filters.start_date}
                                    onChange={(e) => setFilters({ ...filters, start_date: e.target.value, end_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={filters.start_date}
                                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={filters.end_date}
                                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                            <select
                                value={filters.employee_id}
                                onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            >
                                <option value="">All Employees</option>
                                {employees
                                    .filter(emp => !filters.project_id || tasks.some(t => t.project_id === Number(filters.project_id) && t.assigned_to === emp.employee_id))
                                    .map(emp => (
                                        <option key={emp.employee_id} value={emp.employee_id}>
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                            <select
                                value={filters.project_id}
                                onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            >
                                <option value="">All Projects</option>
                                {projects.map(proj => (
                                    <option key={proj.project_id} value={proj.project_id}>{proj.project_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            >
                                {TASK_STATUSES.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                        {reportData && (
                            <button
                                onClick={handleExport}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                Export to PDF
                            </button>
                        )}
                    </div>
                </div>

                {/* Report Results */}
                {reportData && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Results</h2>
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">Report generated successfully!</p>
                            <p className="text-sm mt-2">Use the "Export to PDF" button to download the report.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
