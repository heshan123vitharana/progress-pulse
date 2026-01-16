import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Task, TaskAssignment, Project, Employee } from '@/types';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks();
        fetchProjects();
        fetchEmployees();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/active-tasks');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setTasks(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch tasks');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setProjects(data);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setProjects([]);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setEmployees(data);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
            setEmployees([]);
        }
    };

    const createTask = async (data: Partial<Task>) => {
        try {
            await api.post('/tasks', data);
            await fetchTasks();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to create task' };
        }
    };

    const updateTask = async (task_id: number, data: Partial<Task>) => {
        try {
            await api.put(`/tasks/${task_id}`, data);
            await fetchTasks();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to update task' };
        }
    };

    const deleteTask = async (task_id: number) => {
        try {
            await api.delete(`/tasks/${task_id}`);
            await fetchTasks();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete task' };
        }
    };

    const assignTask = async (taskId: number, employeeId: number) => {
        try {
            await api.post('/task-assignments', {
                task_id: taskId,
                assigned_to: employeeId,
            });
            await fetchTasks();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to assign task' };
        }
    };

    return {
        tasks,
        projects,
        employees,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        assignTask,
        refetch: fetchTasks,
    };
}
