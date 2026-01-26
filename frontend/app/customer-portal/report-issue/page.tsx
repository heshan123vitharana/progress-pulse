'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import BackButton from '@/components/ui/BackButton';

interface CustomerData {
    customer_id: string;
    customer_name: string;
    projects: { project_id: string; project_name: string }[];
}

export default function ReportIssuePage() {
    const router = useRouter();
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 2,
        project_id: '',
    });
    const [screenshots, setScreenshots] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('customer_token');
        const customerData = localStorage.getItem('customer_data');

        if (!token || !customerData) {
            router.push('/customer-portal/login');
            return;
        }

        setCustomer(JSON.parse(customerData));
    }, [router]);

    // Handle paste for screenshots
    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    await uploadScreenshot(file);
                }
            }
        }
    };

    const uploadScreenshot = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('customer_token');
            const res = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.success) {
                setScreenshots(prev => [...prev, res.data.data.path]);
                toast.success('Screenshot added!');
            }
        } catch (error) {
            toast.error('Failed to upload screenshot');
        } finally {
            setUploading(false);
        }
    };

    const removeScreenshot = (index: number) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('customer_token');
            const response = await api.post('/customer-portal/tasks', {
                ...formData,
                screenshots: screenshots.length > 0 ? screenshots : null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(response.data.message || 'Issue reported successfully!');
                router.push('/customer-portal/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit issue');
        } finally {
            setLoading(false);
        }
    };

    if (!customer) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-sm border-b border-emerald-500/20 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <BackButton
                            href="/customer-portal/dashboard"
                            className="bg-transparent border-emerald-500/30 text-emerald-100 hover:bg-emerald-500/10 hover:text-white"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Report New Issue</h1>
                    <p className="text-emerald-200/60">Describe the problem you're experiencing and we'll investigate</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-2">
                            Issue Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
                            placeholder="Brief description of the issue"
                        />
                    </div>

                    {/* Project */}
                    {customer.projects && customer.projects.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-emerald-100 mb-2">
                                Related Project
                            </label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
                            >
                                <option value="" className="bg-slate-800">Select a project (optional)</option>
                                {customer.projects.map((project) => (
                                    <option key={project.project_id} value={project.project_id} className="bg-slate-800">
                                        {project.project_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-2">
                            Priority Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 1, label: 'Low', color: 'emerald' },
                                { value: 2, label: 'Medium', color: 'amber' },
                                { value: 3, label: 'High', color: 'red' },
                            ].map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p.value })}
                                    className={`py-3 rounded-xl border-2 transition-all font-medium ${formData.priority === p.value
                                        ? p.color === 'emerald'
                                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                            : p.color === 'amber'
                                                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                                : 'border-red-500 bg-red-500/20 text-red-400'
                                        : 'border-white/20 text-white/60 hover:border-white/40'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-2">
                            Detailed Description *
                        </label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={5}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all resize-none"
                            placeholder="Please provide as much detail as possible..."
                        />
                    </div>

                    {/* Screenshots - Paste Zone */}
                    <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-2">
                            Screenshots
                        </label>
                        <div
                            onPaste={handlePaste}
                            tabIndex={0}
                            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${uploading
                                ? 'border-emerald-400 bg-emerald-500/10'
                                : 'border-white/20 hover:border-emerald-500/50 hover:bg-white/5'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-emerald-200/70">
                                    {uploading ? 'Uploading...' : 'Click here and paste screenshot (Ctrl+V)'}
                                </p>
                                <p className="text-xs text-emerald-200/40">
                                    Screenshots help us understand the issue better
                                </p>
                            </div>
                        </div>

                        {/* Screenshots Preview */}
                        {screenshots.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {screenshots.map((src, index) => (
                                    <div key={index} className="relative group rounded-lg overflow-hidden border border-white/10">
                                        <img src={src} alt={`Screenshot ${index + 1}`} className="w-full h-32 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeScreenshot(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-4">
                        <Link
                            href="/customer-portal/dashboard"
                            className="flex-1 py-3.5 text-center border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors font-medium"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Issue'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
