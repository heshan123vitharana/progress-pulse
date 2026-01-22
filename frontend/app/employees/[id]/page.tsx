'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';

interface EmployeeDetails {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    office_phone?: string | null;
    private_phone?: string | null;
    department_name?: string;
    designation_name?: string;
    status: string;
    role_id?: string;
}

export default function EmployeeDetailsPage() {
    const params = useParams();
    const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await api.get(`/employees/${params.id}`);
                if (res.data.success) {
                    setEmployee(res.data.data);
                } else {
                    setError(res.data.message || 'Failed to fetch employee details');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error loading employee');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchEmployee();
        }
    }, [params.id]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <Sidebar>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Sidebar>
        );
    }

    if (error || !employee) {
        return (
            <Sidebar>
                <div className="p-8 text-center text-slate-500">
                    <p>{error || 'Employee not found'}</p>
                    <Link href="/employees" className="text-rose-600 hover:underline mt-4 inline-block">Back to Employees</Link>
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="p-6 lg:p-8 max-w-5xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/employees"
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Employee Details</h1>
                        <p className="text-slate-500 text-sm">View employee information</p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6">
                    <div className="relative h-32 bg-gradient-to-r from-rose-400 to-pink-500">
                        <div className="absolute -bottom-10 left-8">
                            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg transform rotate-3">
                                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400">
                                    {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 pb-6 px-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-1">{employee.first_name} {employee.last_name}</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-500 font-medium">{employee.designation_name || 'No Designation'}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(employee.status)}`}>
                                        {employee.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            {/* Placeholder for Role Badge if we had role name available directly without extra fetch, 
                        or we can fetch role if needed. For now simplest is status. */}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</label>
                                <p className="text-slate-700 font-medium mt-1">{employee.email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Office Phone</label>
                                    <p className="text-slate-700 font-medium mt-1">{employee.office_phone || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Private Phone</label>
                                    <p className="text-slate-700 font-medium mt-1">{employee.private_phone || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Employment Details */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Employment Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Department</label>
                                <p className="text-slate-700 font-medium mt-1">{employee.department_name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Employee ID</label>
                                <p className="text-slate-700 font-medium mt-1">#{employee.employee_id}</p>
                            </div>
                            {/* Add Joined Date if available in future */}
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
