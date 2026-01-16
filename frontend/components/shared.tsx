import Link from 'next/link';

export const PageHeader = ({ title, backHref, action }: { title: string; backHref: string; action?: React.ReactNode }) => (
    <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
                <Link href={backHref} className="text-blue-600 text-sm block mb-1">← Back</Link>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            {action}
        </div>
    </header>
);

export const LoadingSpinner = () => (
    <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
    </div>
);

export const EmptyState = ({ message }: { message: string }) => (
    <div className="p-8 text-center text-gray-500">{message}</div>
);

export const StatusBadge = ({ status, colorClass }: { status: string; colorClass?: string }) => {
    const getStatusColor = (s: string) => {
        const lower = s?.toLowerCase() || '';
        if (lower === 'active') return 'bg-green-100 text-green-800';
        if (lower === 'inactive') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass || getStatusColor(status)}`}>
            {displayStatus}
        </span>
    );
};
