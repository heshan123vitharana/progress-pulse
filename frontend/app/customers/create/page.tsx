'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCustomers } from '@/hooks/use-customers';
import PhoneInput from '@/components/ui/PhoneInput';

export default function CustomerFormPage() {
    const router = useRouter();
    const params = useParams();
    const isEdit = !!params?.id;
    const customerId = params?.id ? parseInt(params.id as string) : null;

    const { customers, createCustomer, updateCustomer } = useCustomers();

    const [formData, setFormData] = useState({
        customer_name: '',
        company: '',
        email: '',
        phone: isEdit ? '' : '+94 ',
        address: '',
        status: 'active' as 'active' | 'inactive',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit && customerId && customers.length > 0) {
            const customer = customers.find(c => c.customer_id === customerId);
            if (customer) {
                setFormData({
                    customer_name: customer.customer_name,
                    company: customer.company || '',
                    email: customer.email || '',
                    phone: customer.phone || '',
                    address: customer.address || '',
                    status: customer.status,
                });
            }
        }
    }, [isEdit, customerId, customers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload: any = { ...formData, mobile_phone: formData.phone };
        delete payload.phone;

        if (!isEdit && !payload.customer_code) {
            payload.customer_code = `CUST-${Date.now()}`;
        }

        const result = isEdit && customerId
            ? await updateCustomer(customerId, payload)
            : await createCustomer(payload);

        if (result.success) {
            router.push('/customers');
        } else {
            console.error(result.error);
            setError(result.error || 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/customers" className="text-blue-600 hover:text-blue-700 text-sm mb-1 block">
                        ← Back to Customers
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Edit Customer' : 'Add New Customer'}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="customer@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                            </label>
                            <PhoneInput
                                value={formData.phone}
                                onChange={(value) => setFormData({ ...formData, phone: value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                        </label>
                        <textarea
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status *
                        </label>
                        <select
                            required
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
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
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isEdit ? 'Update Customer' : 'Create Customer')}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
