'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useEmployees } from '@/hooks/use-employees';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function EmployeesPage() {
  const { employees, departments, loading, deleteEmployee, refetch } = useEmployees();
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Fetch roles and check admin status
  useEffect(() => {
    const fetchRolesAndCheckAdmin = async () => {
      try {
        // Fetch roles
        const rolesRes = await api.get('/roles');
        setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : rolesRes.data.data || []);

        // Check admin status
        if (currentUser?.id) {
          const permRes = await api.get(`/users/${currentUser.id}/permissions`);
          if (permRes.data.success) {
            const role = permRes.data.role;
            const perms = permRes.data.data || [];
            setIsAdmin(role?.slug === 'admin' || perms.includes('manage_users') || perms.includes('manage_permissions'));
          }
        }
      } catch (error) {
        console.log('Using fallback permissions');
        setIsAdmin(true); // Fallback
      }
    };
    if (currentUser?.id) {
      fetchRolesAndCheckAdmin();
    }
  }, [currentUser?.id]);

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

  const handleRoleChange = async (employeeId: number) => {
    if (!selectedRoleId) {
      toast.error('Please select a role');
      return;
    }
    try {
      // Find the user associated with this employee
      const employee = employees.find(e => e.employee_id === employeeId);
      if (!employee) {
        toast.error('Employee not found');
        return;
      }

      // Update the user's role via employee API or user API
      await api.put(`/employees/${employeeId}/role`, { role_id: parseInt(selectedRoleId) });
      toast.success('Role updated successfully');
      setEditingRoleId(null);
      setSelectedRoleId('');
      refetch?.();
    } catch (error: any) {
      // If employee role API doesn't exist, show message
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to update role';
      toast.error(errorMsg);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRoleBadgeColor = (roleSlug?: string) => {
    const colors: Record<string, string> = {
      'admin': 'bg-red-100 text-red-700 border-red-200',
      'manager': 'bg-purple-100 text-purple-700 border-purple-200',
      'qa': 'bg-green-100 text-green-700 border-green-200',
      'implementation_officer': 'bg-blue-100 text-blue-700 border-blue-200',
      'developer': 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return colors[roleSlug || ''] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getEmployeeRole = (employee: any) => {
    // If employee has role info
    if (employee.role) return employee.role;
    if (employee.role_id) {
      return roles.find(r => r.id == employee.role_id);
    }
    return null;
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Employees</h1>
              <p className="text-slate-500 text-sm">{filtered.length} of {employees.length} employees</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/roles"
                className="inline-flex items-center px-4 py-2.5 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-800 shadow-lg transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Manage Roles
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/employees/create"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/30 hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Employee
              </Link>
            )}
          </div>
        </div>

        {/* Admin Notice */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-purple-900">Admin Access</p>
                <p className="text-sm text-purple-700">You can assign roles to employees. Click the role badge to change an employee permissions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 mb-6 border border-slate-200/50">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Loading employees...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No employees found</h3>
              <p className="text-slate-500 mb-6">Add your first employee to get started</p>
              {isAdmin && (
                <Link
                  href="/employees/create"
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/30 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add Employee
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(e => {
                    const employeeRole = getEmployeeRole(e);
                    const isEditingRole = editingRoleId === e.employee_id;

                    return (
                      <tr key={e.employee_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-rose-500/25 mr-3">
                              {e.first_name.charAt(0)}{e.last_name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{e.first_name} {e.last_name}</p>
                              <p className="text-xs text-slate-500">{e?.designation?.designation_name || 'No designation'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{e.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{e.department?.department_name || '-'}</td>
                        <td className="px-6 py-4">
                          {isEditingRole ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedRoleId}
                                onChange={(ev) => setSelectedRoleId(ev.target.value)}
                                className="px-2 py-1 border rounded-lg text-slate-700 bg-white text-sm"
                              >
                                <option value="">Select Role</option>
                                {roles.map(r => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleRoleChange(e.employee_id)}
                                className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => { setEditingRoleId(null); setSelectedRoleId(''); }}
                                className="px-2 py-1 bg-slate-400 text-white rounded text-xs hover:bg-slate-500"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (isAdmin) {
                                  setEditingRoleId(e.employee_id);
                                  setSelectedRoleId(employeeRole?.id?.toString() || '');
                                }
                              }}
                              disabled={!isAdmin}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getRoleBadgeColor(employeeRole?.slug)} ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                              title={isAdmin ? 'Click to change role' : ''}
                            >
                              {employeeRole?.name || 'No Role'}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(e.status)}`}>
                            {e.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {isAdmin ? (
                              <>
                                <Link
                                  href={`/employees/${e.employee_id}/edit`}
                                  className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                                  title="Edit Employee"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                                <button
                                  onClick={() => handleDelete(e.employee_id, e.first_name, e.last_name)}
                                  className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                                  title="Delete Employee"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <Link
                                href={`/employees/${e.employee_id}`}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-semibold tracking-wide shadow-md shadow-sky-500/20 hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                              >
                                <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Profile
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
