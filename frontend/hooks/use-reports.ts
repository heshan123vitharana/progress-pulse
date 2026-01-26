import { useState } from 'react';
import api from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportFilters {
    start_date?: string;
    end_date?: string;
    employee_id?: number;
    project_id?: number;
    status?: string;
}

export function useReports() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateDailyReport = async (filters: ReportFilters) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/reports/daily-tasks', { params: filters });
            return { success: true, data: response.data };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to generate report';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const generateTaskReport = async (filters: ReportFilters) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/reports/tasks', { params: filters });
            return { success: true, data: response.data };
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to generate report';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };



    const exportReport = async (type: 'daily' | 'tasks', filters: ReportFilters) => {
        try {
            setLoading(true);

            // Fetch data first
            let data: any[] = [];
            if (type === 'daily') {
                const res = await generateDailyReport(filters);
                if (res.success) data = res.data;
                else throw new Error(res.error);
            } else {
                const res = await generateTaskReport(filters);
                if (res.success) data = res.data;
                else throw new Error(res.error);
            }

            if (!data || data.length === 0) {
                setError("No data available to export");
                return { success: false, error: "No data" };
            }

            // Generate PDF
            const doc = new jsPDF();
            const dateStr = new Date().toLocaleDateString();

            // Header
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text("Progress Pulse Report", 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${dateStr}`, 14, 30);
            doc.text(`Report Type: ${type === 'daily' ? 'Daily Task Report' : 'Task Summary Report'}`, 14, 35);

            // Table Columns & Rows
            let head = [];
            let body = [];

            if (type === 'daily') {
                head = [['Code', 'Task Name', 'Project', 'Module', 'Assigned To', 'Priority']];
                body = data.map((item: any) => [
                    item.task_code || '-',
                    item.task_name || '-',
                    item.project_name || '-',
                    item.module_name || '-',
                    item.assigned_to || '-',
                    item.priority || '-'
                ]);
            } else {
                head = [['Code', 'Task Name', 'Project', 'Assigned To', 'Status', 'Date']];
                body = data.map((item: any) => [
                    item.task_code || '-',
                    item.task_name || '-',
                    item.project_name || '-',
                    item.assigned_to || '-',
                    item.status || '-',
                    item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'
                ]);
            }

            autoTable(doc, {
                head: head,
                body: body,
                startY: 40,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                styles: { fontSize: 8, cellPadding: 3 },
            });

            // Footer
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
            }

            doc.save(`report_${type}_${new Date().toISOString().split('T')[0]}.pdf`);

            return { success: true };
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.message || 'Failed to export report';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        generateDailyReport,
        generateTaskReport,
        exportReport,
    };
}
