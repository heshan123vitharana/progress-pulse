"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEmployees } from "@/hooks/use-employees";
import { toast } from "react-hot-toast";
import PhoneInput from "@/components/ui/PhoneInput";
import api from "@/lib/api";

interface EmployeeFormProps {
    isEdit?: boolean;
    employeeId?: number | null;
}

export default function EmployeeForm({ isEdit = false, employeeId = null }: EmployeeFormProps) {
    const router = useRouter();
    const { employees, departments, designations, createEmployee, updateEmployee } = useEmployees();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: isEdit ? "" : "+94 ",
        department_id: "",
        designation_id: "",
        reports_to_id: "",
        role_id: "",
        status: "inactive" as "active" | "inactive",
    });

    const [roles, setRoles] = useState<any[]>([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get('/roles');
                setRoles(Array.isArray(response.data) ? response.data : (response.data.data || []));
            } catch (error) {
                console.error('Failed to fetch roles:', error);
            }
        };
        fetchRoles();
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit && employeeId && employees.length > 0) {
            const employee = employees.find((e) => e.employee_id.toString() === employeeId.toString());
            if (employee) {
                setFormData({
                    first_name: employee.first_name || "",
                    last_name: employee.last_name || "",
                    email: employee.email || "",
                    phone: employee.phone || "",
                    department_id: employee.department_id ? employee.department_id.toString() : "",
                    designation_id: employee.designation_id ? employee.designation_id.toString() : "",
                    reports_to_id: employee.reports_to_id ? employee.reports_to_id.toString() : "",
                    role_id: (employee as any).role_id || "", // Cast to any if role_id is not in standard Employee type yet
                    status: employee.status || "inactive",
                });
            }
        }
    }, [isEdit, employeeId, employees]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const data = {
            ...formData,
            office_phone: formData.phone, // Map phone to office_phone for API
            department_id: parseInt(formData.department_id),
            designation_id: parseInt(formData.designation_id),
            reports_to_id: formData.reports_to_id ? parseInt(formData.reports_to_id) : undefined,
            role_id: formData.role_id ? parseInt(formData.role_id) : undefined,
        };
        // Remove phone from payload to match API schema exact expectation if using strict validation, 
        // but typically extra fields are ignored. To be safe, rely on the destructuring above if needed, 
        // but actually ...formData includes 'phone'. Zod strip() might handle it, but better safe.
        // Actually the API route uses Zod .parse() which strips unknown? No, default prevents unknown if strict()? 
        // Zod defaults to stripping unknown keys if not specified in .strict().
        // Let's assume standard Zod behavior.

        const result =
            isEdit && employeeId
                ? await updateEmployee(employeeId, data)
                : await createEmployee(data);

        if (result.success) {
            toast.success(
                isEdit ? "Employee updated successfully" : "Employee created successfully"
            );
            router.push("/employees");
        } else {
            const errorMessage = result.error || "An error occurred";
            toast.error(errorMessage);
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/employees"
                        className="text-blue-600 hover:text-blue-700 text-sm mb-1 block"
                    >
                        ← Back to Employees
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? "Edit Employee" : "Add New Employee"}
                    </h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-lg shadow-sm p-6 space-y-6"
                >
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Employee Code Removed (Generated by System) */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.first_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, first_name: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="John"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, last_name: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                            </label>
                            <PhoneInput
                                value={formData.phone || ""}
                                onChange={(value) => setFormData({ ...formData, phone: value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Department *
                            </label>
                            <select
                                id="department_id"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.department_id || ""}
                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={Number(dept.department_id)} value={dept.department_id.toString()}>
                                        {dept.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="designation_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Designation *
                            </label>
                            <select
                                id="designation_id"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.designation_id || ""}
                                onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                            >
                                <option value="">Select Designation</option>
                                {designations.map((desig) => (
                                    <option key={Number(desig.designation_id)} value={desig.designation_id.toString()}>
                                        {desig.designation_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="reports_to_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Supervised By
                            </label>
                            <select
                                id="reports_to_id"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.reports_to_id || ""}
                                onChange={(e) => setFormData({ ...formData, reports_to_id: e.target.value })}
                            >
                                <option value="">None (Top Level)</option>
                                {employees
                                    .filter(e => !isEdit || !employeeId || e.employee_id.toString() !== employeeId.toString())
                                    .map((emp) => (
                                        <option key={Number(emp.employee_id)} value={emp.employee_id.toString()}>
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                            </select>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status *
                            </label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value as "active" | "inactive",
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-2">
                                System Role (User Permission)
                            </label>
                            <select
                                id="role_id"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.role_id || ""}
                                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                            >
                                <option value="">None (No System Access)</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Assigns the user's permission level in the system.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link
                            href="/employees"
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading
                                ? "Saving..."
                                : isEdit
                                    ? "Update Employee"
                                    : "Create Employee"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
