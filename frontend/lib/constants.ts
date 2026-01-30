// Shared constants
export const TASK_STATUSES = [
    { value: '1', label: 'Assigned', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { value: '2', label: 'Accept', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: '3', label: 'In-Progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: '4', label: 'In-QA', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { value: '5', label: 'QA-In-Progress', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    { value: '6', label: 'In-Repeating', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { value: '7', label: 'In-Test Server', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    { value: '8', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-300' },
];

export const PRIORITY_LEVELS = [
    { value: 1, label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 2, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 3, label: 'Low', color: 'bg-green-100 text-green-800' },
];

export const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];
