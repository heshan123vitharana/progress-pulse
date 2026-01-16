'use client';

import { useState, useEffect } from 'react';

const slides = [
    {
        src: '/slideshow-1.png',
        alt: 'Modern team collaboration with project dashboards',
    },
    {
        src: '/slideshow-2.png',
        alt: 'Futuristic data analytics visualization',
    },
    {
        src: '/slideshow-3.png',
        alt: 'Project planning and task management',
    },
    {
        src: '/slideshow-4.png',
        alt: 'Digital workplace productivity',
    },
];

export default function LoginSlideshow() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isPaused, currentSlide]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <div
            className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/[0.02] via-transparent to-slate-900/[0.03] pointer-events-none z-10"></div>

            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-[5]' : 'opacity-0 z-0'
                        }`}
                >
                    <div className="relative w-full h-full flex items-center justify-center p-12">
                        <img
                            src={slide.src}
                            alt={slide.alt}
                            className={`max-w-full max-h-[90vh] object-contain transition-all duration-[20s] ease-in-out ${index === currentSlide ? 'animate-kenBurns' : ''
                                }`}
                            style={{
                                filter: 'drop-shadow(0 10px 30px rgba(15, 23, 42, 0.08))',
                            }}
                        />
                    </div>
                </div>
            ))}

            {/* Navigation Dots - More Professional Design */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2.5 z-20 bg-white/60 backdrop-blur-md px-4 py-3 rounded-full shadow-lg border border-white/40">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`group relative transition-all duration-500 ${index === currentSlide ? 'w-10' : 'w-2.5'
                            } h-2.5 rounded-full overflow-hidden`}
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        {/* Background */}
                        <div
                            className={`absolute inset-0 transition-all duration-500 ${index === currentSlide
                                ? 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500'
                                : 'bg-slate-300 group-hover:bg-slate-400'
                                }`}
                        />

                        {/* Progress bar for active slide */}
                        {index === currentSlide && !isPaused && (
                            <div
                                key={`progress-${currentSlide}`}
                                className="absolute inset-0 bg-white/20"
                                style={{
                                    animation: 'slideProgress 5s linear',
                                    transformOrigin: 'left',
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Pause indicator - More elegant */}
            {isPaused && (
                <div className="absolute top-8 right-8 bg-white/80 backdrop-blur-md text-slate-700 px-4 py-2 rounded-full text-xs font-semibold shadow-lg border border-white/40 z-20 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    <span>Paused</span>
                </div>
            )}

            <style jsx>{`
                @keyframes slideProgress {
                    from {
                        transform: scaleX(0);
                    }
                    to {
                        transform: scaleX(1);
                    }
                }

                :global(.animate-kenBurns) {
                    animation: kenBurns 20s ease-in-out infinite;
                }

                @keyframes kenBurns {
                    0% {
                        transform: scale(1) translate(0, 0);
                    }
                    50% {
                        transform: scale(1.05) translate(-0.5%, -0.5%);
                    }
                    100% {
                        transform: scale(1) translate(0, 0);
                    }
                }
            `}</style>
        </div>
    );
}

