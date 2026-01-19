'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';

import LoginSlideshow from '@/components/LoginSlideshow';

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="h-screen relative overflow-hidden">
            {/* Calm gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(148,163,184,0.08),transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(191,219,254,0.10),transparent_60%)]"></div>
            </div>







            {/* Right Half - Background Image with Slideshow */}
            <div className="hidden lg:block absolute right-0 top-0 w-1/2 h-full overflow-hidden">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/login-hero.png"
                        alt="Background"
                        className="w-full h-full object-cover opacity-20 blur-sm"
                    />
                    {/* Overlay gradient for blending */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-blue-50/60"></div>
                </div>

                {/* Slideshow Layer on Top */}
                <div className="relative z-10 w-full h-full">
                    <LoginSlideshow />
                </div>
            </div>

            {/* Main login card */}
            <div className="h-screen flex items-center justify-start lg:justify-start relative z-10 p-6 lg:pl-24">
                <div className="w-full max-w-md mx-auto lg:mx-0 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    {/* Card with glassmorphism */}
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

                        {/* Main card */}
                        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/60">
                            {/* Icon badge */}
                            <div className="flex justify-center mb-4">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                                    <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-300">
                                        <img src="/logo_icon.png" alt="Progress Pulse Logo" className="w-10 h-10 object-contain drop-shadow-lg" />
                                    </div>
                                </div>
                            </div>

                            {/* Header */}
                            <div className="text-center mb-4">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                                    Welcome Back
                                </h1>
                                <p className="text-gray-600 text-xs font-medium">
                                    Sign in to access your project dashboard
                                </p>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="mb-5 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl text-xs shadow-sm animate-fadeInUp">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">{error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Email input */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="Enter your email"
                                            className="input-focus w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 bg-white/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md font-medium text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Password input */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Enter your password"
                                            className="input-focus w-full pl-12 pr-12 py-2.5 border-2 border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 bg-white/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md font-medium text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot password */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                        <label htmlFor="remember" className="ml-2 text-xs text-gray-600 font-medium">
                                            Remember me
                                        </label>
                                    </div>
                                    <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary relative w-full group overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5"
                                >
                                    {/* Button shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-sm">Signing you in...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2 text-sm">
                                            Sign In
                                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            </form>

                            {/* Footer */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-center text-xs text-gray-600">
                                    By signing in, you agree to our{' '}
                                    <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                                        Terms of Service
                                    </a>
                                    {' '}and{' '}
                                    <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                                        Privacy Policy
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
