// User & Authentication Types
export interface User {
    id: number;
    name: string;
    email: string;
    employee_id?: number;
    role_id?: number;
    avatar?: string;
    created_at: string;
    updated_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
    message?: string;
}

// Employee Types
export interface Employee {
    employee_id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    department_id: number;
    designation_id: number;
    status: 'active' | 'inactive';
    department?: Department;
    designation?: Designation;
    reports_to_id?: number;
    reports_to?: Employee;
    created_at: string;
    updated_at: string;
}

// Department Types
export interface Department {
    department_id: number;
    department_name: string;
    description?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

// Designation Types
export interface Designation {
    designation_id: number;
    designation_name: string;
    description?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

// Task Types
export interface Task {
    task_id: number;
    task_code?: string;
    task_category?: string;
    task_name: string;
    task_description?: string;
    project_id: number;
    module_id?: number;
    priority: 1 | 2 | 3; // 1=High, 2=Medium, 3=Low
    description?: string;
    created_by: number;
    status: string;
    estimated_hours?: number;
    assigned_to?: number;
    start_date?: string;
    end_date?: string;
    qa_repeated_reason?: string;
    completion_notes?: string;
    project?: Project;
    employee?: Employee;
    created_at: string;
    updated_at: string;
}

// Task Assignment Types
export interface TaskAssignment {
    id: number;
    task_id: number;
    assigned_to: number;
    assigned_by: number;
    status: 1 | 2 | 3 | 4 | 5 | 6; // 1=Created, 2=In Progress, 3=QA, 4=Repeat, 5=Completed, 6=Closed
    start_time?: string;
    end_time?: string;
    actual_hours?: number;
    task?: Task;
    employee?: Employee;
    created_at: string;
    updated_at: string;
}

// Project Types
export interface Project {
    project_id: number;
    project_code: string;
    project_name: string;
    client_id?: number;
    start_date?: string;
    end_date?: string;
    status: string;
    description?: string;
    customer?: Customer;
    supervised_by_id?: number;
    supervised_by?: Employee | number;
    developers?: Employee[] | number[];
    support_team?: Employee[] | number[];
    created_at: string;
    updated_at: string;
}

// Customer Types
export interface Customer {
    customer_id: number;
    customer_code: string;
    customer_name: string;
    company?: string;
    email?: string;
    phone?: string;
    mobile_phone?: string;
    address?: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}

// Dashboard Types
export interface DashboardCounts {
    total_tasks: number;
    active_tasks: number;
    completed_tasks: number;
    high_priority_tasks: number;
    total_employees: number;
    active_employees: number;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

// Pagination Types
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}



// Time Entry Types
export interface TimeEntry {
    id: number;
    user_id: number;
    task_id?: number;
    project_id?: number;
    description?: string;
    start_time: string;
    end_time?: string;
    duration?: number;
    is_billable: boolean;
    hourly_rate?: number;
    status: 'running' | 'stopped' | 'approved' | 'rejected';
    task?: Task;
    project?: Project;
    user?: User;
    created_at: string;
    updated_at: string;
}
