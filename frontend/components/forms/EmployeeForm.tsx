"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEmployees } from "@/hooks/use-employees";
import { toast } from "react-hot-toast";

interface EmployeeFormProps {
    isEdit?: boolean;
    employeeId?: number | null;
}

export default function EmployeeForm({ isEdit = false, employeeId = null }: EmployeeFormProps) {
    const router = useRouter();
    const { employees, departments, designations, createEmployee, updateEmployee } = useEmployees();

    const [formData, setFormData] = useState({
        employee_code: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department_id: "",
        designation_id: "",
        status: "inactive" as "active" | "inactive",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit && employeeId && employees.length > 0) {
            const employee = employees.find((e) => e.employee_id.toString() === employeeId.toString());
            if (employee) {
                setFormData({
                    employee_code: employee.employee_code || "",
                    first_name: employee.first_name || "",
                    last_name: employee.last_name || "",
                    email: employee.email || "",
                    phone: employee.phone || "",
                    department_id: employee.department_id ? employee.department_id.toString() : "",
                    designation_id: employee.designation_id ? employee.designation_id.toString() : "",
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
            department_id: parseInt(formData.department_id),
            designation_id: parseInt(formData.designation_id),
        };

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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employee Code *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.employee_code}
                                onChange={(e) =>
                                    setFormData({ ...formData, employee_code: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="EMP001"
                            />
                        </div>

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
                            <input
                                type="text"
                                id="phone"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1234567890"
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
