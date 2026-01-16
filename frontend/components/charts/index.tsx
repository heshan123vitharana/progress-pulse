'use client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function TaskStatusChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function TaskCompletionTrend({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#374151' }} />
                <YAxis tick={{ fill: '#374151' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="created" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    );
}

export function ResourceUtilization({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#374151' }} />
                <YAxis tick={{ fill: '#374151' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#3B82F6" name="Utilization" />
                <Bar dataKey="capacity" fill="#9CA3AF" name="Total Capacity" />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function ProjectProgress({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#374151' }} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#374151' }} />
                <Tooltip />
                <Bar dataKey="progress" fill="#10B981">
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.progress >= 75 ? '#10B981' : entry.progress >= 50 ? '#F59E0B' : '#EF4444'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export function BurndownChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#374151' }} />
                <YAxis tick={{ fill: '#374151' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ideal" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    );
}
