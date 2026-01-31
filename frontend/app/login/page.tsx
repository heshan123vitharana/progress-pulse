'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                toast.error('Invalid email or password');
                setError('Invalid email or password');
            } else if (result?.ok) {
                toast.success('Successfully logged in!');
                router.push('/dashboard');
            }
        } catch (err: any) {
            toast.error('An error occurred. Please try again.');
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
            {/* Full Background Image with Water-like Animation */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 animate-subtle-flow">
                    <img
                        src="/login-hero.png"
                        alt="Background"
                        className="w-full h-full object-cover scale-110 opacity-60"
                    />
                </div>

                {/* Clean Water Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/40 to-slate-900/60 mix-blend-multiply"></div>

                {/* Subtle Ripple Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-150 contrast-150 mix-blend-overlay"></div>
                <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-blue-400/10 to-transparent rotate-45 animate-ripple"></div>
            </div>

            {/* Login Card - COMPACT Height & Enhanced White Transparency */}
            <div className="relative z-10 w-full max-w-[380px] px-4">
                <div className="relative bg-white/10 backdrop-blur-xl rounded-[24px] p-6 border border-white/20 shadow-2xl ring-1 ring-white/10 overflow-hidden">

                    {/* Glass Shine */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Header - Compact */}
                    <div className="text-center mb-5">
                        <div className="inline-flex justify-center mb-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                                <img
                                    src="/rbs_logo.png"
                                    alt="RBS Logo"
                                    className="w-full h-full object-contain p-1"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML = '<span class="text-slate-900 font-bold text-xl">RBS</span>';
                                    }}
                                />
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-white mb-0.5 tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-white/60 text-[11px] font-medium">
                            Sign in to access your project dashboard
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 bg-red-400/20 border border-red-400/20 text-red-50 px-3 py-2 rounded-lg text-xs flex items-center gap-2 backdrop-blur-sm">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form - Compact Spacing */}
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        {/* Email input */}
                        <div>
                            <label className="block text-[10px] font-bold text-blue-100/80 mb-1 ml-1 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-white/50 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="ashinid@gmail.com"
                                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none text-white placeholder-white/30 focus:border-white/30 focus:bg-white/10 transition-all text-xs font-medium"
                                />
                            </div>
                        </div>

                        {/* Password input */}
                        <div>
                            <label className="block text-[10px] font-bold text-blue-100/80 mb-1 ml-1 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-white/50 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••••"
                                    className="w-full pl-9 pr-9 py-2 bg-white/5 border border-white/10 rounded-xl outline-none text-white placeholder-white/30 focus:border-white/30 focus:bg-white/10 transition-all text-xs font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember me & Forgot password - Compact */}
                        <div className="flex items-center justify-between pt-0.5">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-3.5 h-3.5 border border-white/30 rounded bg-white/5 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer appearance-none relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[10px] checked:after:top-[-2px] checked:after:left-[2px]"
                                />
                                <label htmlFor="remember" className="ml-2 text-[11px] text-white/70 font-medium cursor-pointer select-none hover:text-white transition-colors">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="text-[11px] text-cyan-300/90 hover:text-white font-medium transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit button - Compact */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-1 bg-white hover:bg-white/90 text-slate-900 font-bold py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-white/10 transform hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-xs">Signing in...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                                    Sign In
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer - Compact */}
                    <div className="mt-5 pt-4 border-t border-white/10 text-center">
                        <p className="text-[10px] text-white/40">
                            By signing in, I agree to the{' '}
                            <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a>
                            {' '}&{' '}
                            <a href="#" className="text-white/60 hover:text-white transition-colors">Terms of Service</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Subtle Animations */}
            <style jsx>{`
                @keyframes subtle-flow {
                    0% { transform: scale(1.1); }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1.1); }
                }
                .animate-subtle-flow {
                    animation: subtle-flow 20s ease-in-out infinite;
                }
                @keyframes ripple {
                    0% { transform: translateY(100%) rotate(45deg); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(-100%) rotate(45deg); opacity: 0; }
                }
                .animate-ripple {
                    animation: ripple 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
