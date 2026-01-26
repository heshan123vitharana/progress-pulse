import Link from 'next/link';

interface BackButtonProps {
    href?: string;
    label?: string;
    className?: string;
}

export default function BackButton({
    href = '/dashboard',
    label = 'Back to Dashboard',
    className = ''
}: BackButtonProps) {
    return (
        <Link
            href={href}
            className={`
                inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium 
                text-gray-600 bg-white border border-gray-300 rounded-lg 
                hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm
                ${className}
            `}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {label}
        </Link>
    );
}
