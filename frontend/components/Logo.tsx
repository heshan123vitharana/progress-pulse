'use client';

interface LogoProps {
    variant?: 'default' | 'white';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Logo({ variant = 'default', size = 'md', className = '' }: LogoProps) {
    const sizeClasses = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-2xl'
    };

    const iconSizes = {
        sm: 'w-5 h-5',
        md: 'w-7 h-7',
        lg: 'w-10 h-10'
    };

    const isWhite = variant === 'white';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Icon with gradient background */}
            <div className={`relative ${iconSizes[size]} rounded-xl flex items-center justify-center overflow-hidden group`}>
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 group-hover:scale-110 transition-transform duration-300"></div>

                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                {/* Lightning bolt icon */}
                <svg
                    className="relative z-10 w-full h-full p-1.5 text-white drop-shadow-lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                </svg>
            </div>

            {/* Text */}
            <div className="flex flex-col justify-center">
                <span className={`font-bold ${sizeClasses[size]} tracking-tight leading-none ${isWhite ? 'text-white' : 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'
                    }`}>
                    Progress Pulse
                </span>
                {size === 'lg' && (
                    <span className={`text-xs font-medium ${isWhite ? 'text-white/80' : 'text-gray-500'
                        } tracking-wide`}>
                        Project Management System
                    </span>
                )}
            </div>
        </div>
    );
}
