'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useReports } from '@/hooks/use-reports';
import { useEmployees } from '@/hooks/use-employees';
import { useProjects } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import { LoadingSpinner } from '@/components/shared';
import ReportPreview from '@/components/reports/ReportPreview';

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
    const { generateDailyReport, generateTaskReport, exportReport, silentPrintReport, exportToExcel, loading } = useReports();
    const { employees } = useEmployees();
    const { projects } = useProjects();
    const { tasks } = useTasks();

    const [reportType, setReportType] = useState<'daily' | 'tasks'>('daily');
    const [zoomLevel, setZoomLevel] = useState(1.0);

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

    const handlePrint = async () => {
        const filterParams = {
            ...filters,
            employee_id: filters.employee_id ? parseInt(filters.employee_id) : undefined,
            project_id: filters.project_id ? parseInt(filters.project_id) : undefined,
        };

        await silentPrintReport(reportType, filterParams);
    };

    const handleExcelExport = async () => {
        const filterParams = {
            ...filters,
            employee_id: filters.employee_id ? parseInt(filters.employee_id) : undefined,
            project_id: filters.project_id ? parseInt(filters.project_id) : undefined,
        };

        await exportToExcel(reportType, filterParams);
    };

    return (
        <Sidebar>
            <div className="p-6 lg:p-8 space-y-8 min-h-screen font-sans">
                {/* --- HERO SECTION --- */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-900 p-10 shadow-2xl text-white">
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight">Analytics & Reports</h1>
                        <p className="text-emerald-100/80 text-lg max-w-2xl">
                            Generate detailed insights on team performance, project progress, and daily activities.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* --- LEFT PANEL: Configuration --- */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100/60 p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                Report Configuration
                            </h2>

                            {/* Report Type Switcher */}
                            <div className="bg-slate-100 p-1.5 rounded-xl flex mb-8">
                                <button
                                    onClick={() => {
                                        setReportType('daily');
                                        setFilters(prev => ({ ...prev, start_date: today, end_date: today }));
                                    }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${reportType === 'daily'
                                        ? 'bg-white text-emerald-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Daily Report
                                </button>
                                <button
                                    onClick={() => setReportType('tasks')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${reportType === 'tasks'
                                        ? 'bg-white text-emerald-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Task Summary
                                </button>
                            </div>

                            {/* Filters Interface */}
                            <div className="space-y-5">
                                {reportType === 'daily' ? (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Date</label>
                                        <input
                                            type="date"
                                            value={filters.start_date}
                                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value, end_date: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                                            <input
                                                type="date"
                                                value={filters.start_date}
                                                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                                            <input
                                                type="date"
                                                value={filters.end_date}
                                                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee</label>
                                    <select
                                        value={filters.employee_id}
                                        onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700"
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
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project</label>
                                    <select
                                        value={filters.project_id}
                                        onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700"
                                    >
                                        <option value="">All Projects</option>
                                        {projects.map(proj => (
                                            <option key={proj.project_id} value={proj.project_id}>{proj.project_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700"
                                    >
                                        {TASK_STATUSES.map(status => (
                                            <option key={status.value} value={status.value}>{status.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><LoadingSpinner /> Processing...</>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                            Generate Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT PANEL: Results --- */}
                    <div className="lg:col-span-8 flex flex-col h-full">
                        {reportData ? (
                            <div className="flex flex-col h-full space-y-4">
                                {/* Toolbar */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-slate-700">Preview</h2>
                                        <div className="h-4 w-px bg-slate-200 mx-2"></div>
                                        {/* Zoom Controls */}
                                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                            <button
                                                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                                                className="p-1.5 hover:bg-white hover:text-emerald-600 rounded-md text-slate-500 transition-all"
                                                title="Zoom Out"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                            </button>
                                            <span className="text-xs font-mono font-medium px-2 min-w-[3rem] text-center">
                                                {Math.round(zoomLevel * 100)}%
                                            </span>
                                            <button
                                                onClick={() => setZoomLevel(Math.min(2.0, zoomLevel + 0.1))}
                                                className="p-1.5 hover:bg-white hover:text-emerald-600 rounded-md text-slate-500 transition-all"
                                                title="Zoom In"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            </button>
                                            <button
                                                onClick={() => setZoomLevel(1.0)}
                                                className="ml-1 p-1.5 hover:bg-white hover:text-emerald-600 rounded-md text-slate-500 transition-all"
                                                title="Reset Zoom"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleExport}
                                            disabled={loading}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            PDF
                                        </button>
                                        <button
                                            onClick={handleExcelExport}
                                            disabled={loading}
                                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            Excel
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            disabled={loading}
                                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                            Print
                                        </button>
                                    </div>
                                </div>

                                {/* Zoomable Preview Container */}
                                <div className="flex-1 bg-slate-200/50 rounded-2xl border border-slate-200 overflow-auto p-8 flex justify-center relative shadow-inner">
                                    <div
                                        style={{
                                            transform: `scale(${zoomLevel})`,
                                            transformOrigin: 'top center',
                                            transition: 'transform 0.2s ease-out'
                                        }}
                                        className="origin-top"
                                    >
                                        <ReportPreview
                                            type={reportType}
                                            data={reportData}
                                            filters={filters}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 h-full flex flex-col items-center justify-center text-center opacity-75">
                                <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Analysis Awaits</h3>
                                <p className="text-slate-500 max-w-lg">
                                    Select your parameters on the left and click <strong>Generate Report</strong> to visualize your data.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
