"use client";

import EmployeeForm from "@/components/forms/EmployeeForm";
import { useParams } from "next/navigation";

export default function EditEmployeePage() {
    const params = useParams();
    const employeeId = params?.id ? parseInt(params.id as string) : null;

    return <EmployeeForm isEdit={true} employeeId={employeeId} />;
}
