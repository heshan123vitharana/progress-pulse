'use client';
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { PageHeader, LoadingSpinner, EmptyState, StatusBadge } from '@/components/shared';
import { useEmployees } from '@/hooks/use-employees';

export default function EmployeesPage() {
  const { employees, departments, loading, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = employees.filter(e => {
    const matchesSearch =
      e.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDept || e.department_id?.toString() === filterDept;
    const matchesStatus = !filterStatus || e.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleDelete = async (id: number, first_name: string, last_name: string) => {
    if (confirm(`Delete employee "${first_name} ${last_name}"?`)) {
      const result = await deleteEmployee(id);
      if (!result.success) alert(result.error);
    }
  };

  return (
    <Sidebar>
      <PageHeader title="Employee Management" backHref="/dashboard" action={<Link href="/employees/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add Employee</Link>} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white placeholder-gray-500" />
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 bg-white">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState message="No employees found" /> : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(e => (
                  <tr key={e.employee_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{e.first_name} {e.last_name}</td>
                    <td className="px-6 py-4 text-sm">{e.email}</td>
                    <td className="px-6 py-4 text-sm">{e.department?.department_name || '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={e.status} /></td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Link href={`/employees/${e.employee_id}/edit`} className="text-blue-600">Edit</Link>
                      <button onClick={() => handleDelete(e.employee_id, e.first_name, e.last_name)} className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </Sidebar>
  );
}
