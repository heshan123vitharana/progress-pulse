'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { TaskStatusChart, TaskCompletionTrend, ResourceUtilization, ProjectProgress, BurndownChart } from '@/components/charts';
import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useEmployees } from '@/hooks/use-employees';
import BackButton from '@/components/ui/BackButton';

export default function AnalyticsPage() {
    const { tasks } = useTasks();
    const { projects } = useProjects();
    const { employees } = useEmployees();
    const [dateRange, setDateRange] = useState('7'); // days

    // Task Status Distribution
    const taskStatusData = [
        { name: 'Assigned', value: tasks.filter(t => t.status === '1').length },
        { name: 'Accept', value: tasks.filter(t => t.status === '2').length },
        { name: 'In-Progress', value: tasks.filter(t => t.status === '3').length },
        { name: 'In-QA', value: tasks.filter(t => t.status === '4').length },
        { name: 'QA-In-Progress', value: tasks.filter(t => t.status === '5').length },
        { name: 'In-Repeating', value: tasks.filter(t => t.status === '6').length },
        { name: 'In-Test Server', value: tasks.filter(t => t.status === '7').length },
        { name: 'Completed', value: tasks.filter(t => t.status === '8').length },
    ].filter(item => item.value > 0);

    // Task Completion Trend (Last 7 days)
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const completionTrendData = getLast7Days().map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: Math.floor(Math.random() * 10) + 5, // Mock data - replace with real data
        created: Math.floor(Math.random() * 8) + 3,
    }));

    // Resource Utilization
    const resourceData = employees.slice(0, 5).map(emp => ({
        name: emp.first_name || 'Employee',
        hours: Math.floor(Math.random() * 40) + 10, // Mock data
        capacity: 40,
    }));

    // Project Progress
    const projectProgressData = projects.slice(0, 5).map(proj => ({
        name: proj.project_name.substring(0, 20),
        progress: Math.floor(Math.random() * 100), // Mock data
    }));

    // Burndown Chart
    const burndownData = getLast7Days().map((date, index) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ideal: 100 - (index * 14.3),
        actual: 100 - (index * 12) - Math.random() * 10,
    }));

    return (
        <Sidebar>
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                        <BackButton />
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Total Tasks</p>
                        <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Active Projects</p>
                        <p className="text-3xl font-bold text-green-600">{projects.filter(p => p.status === 'active').length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Team Members</p>
                        <p className="text-3xl font-bold text-purple-600">{employees.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Completion Rate</p>
                        <p className="text-3xl font-bold text-orange-600">
                            {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === '8').length / tasks.length) * 100) : 0}%
                        </p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Task Status Distribution</h3>
                        <TaskStatusChart data={taskStatusData} />
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Task Completion Trend</h3>
                        <TaskCompletionTrend data={completionTrendData} />
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Resource Utilization</h3>
                        <ResourceUtilization data={resourceData} />
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Project Progress</h3>
                        <ProjectProgress data={projectProgressData} />
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Sprint Burndown Chart</h3>
                        <BurndownChart data={burndownData} />
                    </div>
                </div>
            </main>
        </Sidebar>
    );
}
