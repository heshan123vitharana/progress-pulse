'use client';

import { useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';

export default function ProfilePage() {
    const { user, login } = useAuthStore();
    const { update } = useSession();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password visibility state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const checkPasswordStrength = (password: string) => {
        if (password.length < 6) return 'weak';
        if (password.length < 10) return 'medium';
        return 'strong';
    };

    const getStrengthColor = (strength: string) => {
        switch (strength) {
            case 'weak': return 'bg-rose-500';
            case 'medium': return 'bg-amber-500';
            case 'strong': return 'bg-emerald-500';
            default: return 'bg-slate-200';
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // MAX 5MB
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            // 1. Upload file
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.success) throw new Error(uploadData.message);

            // 2. Update profile
            const updateRes = await api.post('/profile/update', {
                avatar: uploadData.data.path
            });

            if (updateRes.data.success) {
                toast.success('Profile picture updated');

                // Update local auth store
                if (user) {
                    const updatedUser = { ...user, avatar: uploadData.data.path };
                    const { setUser } = useAuthStore.getState();
                    setUser(updatedUser);
                }

                // Update session
                await update({ avatar: uploadData.data.path });
            } else {
                throw new Error(updateRes.data.message);
            }

        } catch (error: any) {
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });

            if (response.data.success) {
                toast.success('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(response.data.message || 'Failed to update password');
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'An error occurred';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sidebar>
            <div className="p-6 lg:p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">My Profile</h1>
                        <p className="text-slate-500">Manage your account settings and preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Info Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                            <div className="relative h-32 bg-gradient-to-r from-cyan-500 to-blue-600">
                                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl relative overflow-hidden">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-full h-full rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        {/* Overlay for upload */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                            {uploading ? (
                                                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-12 pb-8 px-6 text-center">
                                <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
                                <p className="text-slate-500 text-sm mb-4">{user?.email}</p>
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                                    Active Account
                                </div>
                            </div>
                            <div className="border-t border-slate-100 px-6 py-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Employee ID</span>
                                        <span className="font-medium text-slate-700">EMP{String(user?.employee_id || 0).padStart(3, '0')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Role</span>
                                        <span className="font-medium text-slate-700 capitalize">
                                            {user?.role_id === 1 ? 'Administrator' : 'Employee'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Joined</span>
                                        <span className="font-medium text-slate-700">
                                            {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 p-6 lg:p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Security Settings</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            required
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white/50 pr-10"
                                            placeholder="Enter your current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showCurrentPassword ? (
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

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white/50 pr-10"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showNewPassword ? (
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

                                    {newPassword && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ${getStrengthColor(checkPasswordStrength(newPassword))}`}
                                                    style={{ width: checkPasswordStrength(newPassword) === 'weak' ? '33%' : checkPasswordStrength(newPassword) === 'medium' ? '66%' : '100%' }}
                                                ></div>
                                            </div>
                                            <span className="text-slate-500 capitalize">{checkPasswordStrength(newPassword)}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white/50 pr-10"
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? (
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
                                </div>

                                <div className="pt-4 flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
