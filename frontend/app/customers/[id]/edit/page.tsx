'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function EditCustomerPage() {
    const router = useRouter();
    const params = useParams();
    const customerId = params?.id as string;

    const [formData, setFormData] = useState({
        customer_code: '',
        customer_name: '',
        company: '',
        email: '',
        mobile_phone: '',
        address: '',
        status: 'active' as 'active' | 'inactive',
        portal_status: 'inactive' as 'active' | 'inactive',
        portal_password: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Fetch customer data
    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await api.get(`/customers/${customerId}`);
                if (response.data.success) {
                    const customer = response.data.data;
                    setFormData({
                        customer_code: customer.customer_code || '',
                        customer_name: customer.customer_name || '',
                        company: customer.company || '',
                        email: customer.email || '',
                        mobile_phone: customer.mobile_phone || '',
                        address: customer.address || '',
                        status: customer.status || 'active',
                        portal_status: customer.portal_status || 'inactive',
                        portal_password: '', // Don't show existing password
                    });
                }
            } catch (err) {
                toast.error('Failed to load customer');
                router.push('/customers');
            } finally {
                setLoading(false);
            }
        };

        if (customerId) {
            fetchCustomer();
        }
    }, [customerId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const payload: any = { ...formData };
            // Only send portal_password if it's been changed
            if (!payload.portal_password) {
                delete payload.portal_password;
            }

            const response = await api.put(`/customers/${customerId}`, payload);

            if (response.data.success) {
                toast.success('Customer updated successfully');
                router.push('/customers');
            } else {
                setError(response.data.message || 'Failed to update customer');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/customers" className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
                        ← Back to Customers
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Customer
                    </h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.customer_code}
                                    onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                    placeholder="CUST-001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                    placeholder="Company Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                    placeholder="customer@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.mobile_phone}
                                    onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                    placeholder="+1234567890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <textarea
                                rows={3}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                placeholder="Enter address"
                            />
                        </div>
                    </div>

                    {/* Portal Access Section */}
                    <div className="border-t pt-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Customer Portal Access
                        </h2>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-emerald-800">
                                Enable portal access to allow this customer to login at <strong>/customer-portal/login</strong> and submit issues.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Portal Status
                                </label>
                                <select
                                    value={formData.portal_status}
                                    onChange={(e) => setFormData({ ...formData, portal_status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white"
                                >
                                    <option value="inactive">Disabled</option>
                                    <option value="active">Enabled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Portal Password {formData.portal_status === 'active' && '(leave blank to keep current)'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.portal_password}
                                    onChange={(e) => setFormData({ ...formData, portal_password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white"
                                    placeholder={formData.portal_status === 'active' ? "Leave blank to keep current" : "Set password to enable"}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Link
                            href="/customers"
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Update Customer'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
