'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useDepartments } from '@/hooks/use-departments';

export default function DepartmentForm() {
    const router = useRouter();
    const params = useParams();
    const isEdit = !!params?.id;
    const { departments, createDepartment, updateDepartment } = useDepartments();
    const [formData, setFormData] = useState({ department_name: '', description: '', status: 'active' as 'active' | 'inactive' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit && params?.id) {
            const dept = departments.find(d => d.id === parseInt(params.id as string));
            if (dept) setFormData({ department_name: dept.department_name, description: dept.description || '', status: dept.status });
        }
    }, [isEdit, params?.id, departments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = isEdit && params?.id ? await updateDepartment(parseInt(params.id as string), formData) : await createDepartment(formData);
        if (result.success) {
            router.push('/departments');
        } else {
            alert(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <Link href="/departments" className="text-blue-600 text-sm block mb-1"> Back</Link>
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Add'} Department</h1>
                </div>
            </header>
            <main className="max-w-3xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input required value={formData.department_name} onChange={e => setFormData({ ...formData, department_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Status *</label>
                        <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })} className="w-full px-4 py-2 border rounded-lg">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Link href="/departments" className="px-6 py-2 border rounded-lg">Cancel</Link>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </main>
        </div>
    );
}
