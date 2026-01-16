"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useEmployees } from "@/hooks/use-employees";

interface StatusToggleProps {
    employeeId: number;
    initialStatus: "active" | "inactive";
    onStatusChange?: (newStatus: "active" | "inactive") => void;
}

export default function StatusToggle({
    employeeId,
    initialStatus,
    onStatusChange,
}: StatusToggleProps) {
    const [status, setStatus] = useState<"active" | "inactive">(initialStatus);
    const [loading, setLoading] = useState(false);
    const { updateEmployee } = useEmployees();

    const handleToggle = async () => {
        const newStatus = status === "active" ? "inactive" : "active";
        setLoading(true);

        try {
            const result = await updateEmployee(employeeId, { status: newStatus });
            if (result.success) {
                setStatus(newStatus);
                toast.success(`Status updated to ${newStatus}`);
                if (onStatusChange) onStatusChange(newStatus);
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred while updating status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-center border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Work Status</h3>

            <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${status === 'inactive' ? 'text-gray-900' : 'text-gray-500'}`}>
                    Inactive
                </span>

                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
            ${status === 'active' ? 'bg-green-600' : 'bg-gray-200'}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                    role="switch"
                    aria-checked={status === 'active'}
                >
                    <span
                        aria-hidden="true"
                        className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${status === 'active' ? 'translate-x-5' : 'translate-x-0'}
            `}
                    />
                </button>

                <span className={`text-sm font-medium ${status === 'active' ? 'text-gray-900' : 'text-gray-500'}`}>
                    Active
                </span>
            </div>

            <p className="text-xs text-gray-500 mt-3">
                {status === 'active' ? 'You are currently working' : 'You are away / off duty'}
            </p>
        </div>
    );
}
