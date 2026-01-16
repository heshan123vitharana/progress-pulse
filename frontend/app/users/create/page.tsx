'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUsers } from '@/hooks/use-users';

export default function UserForm() {
    const router = useRouter();
    const params = useParams();
    const isEdit = !!params?.id;
    const { users, roles, createUser, updateUser } = useUsers();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '', role_id: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit && params?.id) {
            const user = users.find(u => u.id === parseInt(params.id as string));
            if (user) setFormData({ name: user.name, email: user.email, password: '', password_confirmation: '', role_id: user.role_id?.toString() || '' });
        }
    }, [isEdit, params?.id, users]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = { ...formData, role_id: formData.role_id ? parseInt(formData.role_id) : undefined };
        const result = isEdit && params?.id ? await updateUser(parseInt(params.id as string), data) : await createUser(data as any);
        if (result.success) router.push('/users');
        else { alert(result.error); setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <Link href="/users" className="text-blue-600 text-sm block mb-1">← Back</Link>
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Add'} User</h1>
                </div>
            </header>
            <main className="max-w-3xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name *</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email *</label>
                            <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Password {!isEdit && '*'}</label>
                            <input type="password" required={!isEdit} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder={isEdit ? 'Leave blank to keep current' : ''} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm Password {!isEdit && '*'}</label>
                            <input type="password" required={!isEdit} value={formData.password_confirmation} onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <select value={formData.role_id} onChange={e => setFormData({ ...formData, role_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                                <option value="">Select Role</option>
                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Link href="/users" className="px-6 py-2 border rounded-lg">Cancel</Link>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </main>
        </div>
    );
}
