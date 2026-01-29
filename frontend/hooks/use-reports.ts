import { useState } from 'react';
import api from '@/lib/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';


interface ReportFilters {
    start_date?: string;
    end_date?: string;
    employee_id?: number;
    project_id?: number;
    status?: string;
}

const getPriorityLabel = (priority: number | string): string => {
    const p = typeof priority === 'string' ? parseInt(priority) : priority;
    switch (p) {
        case 1: return 'Low';
        case 2: return 'Medium';
        case 3: return 'High';
        case 4: return 'Urgent';
        default: return 'Medium';
    }
};





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




    const createPdfDocument = async (type: 'daily' | 'tasks', filters: ReportFilters) => {
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
            throw new Error("No data available to export");
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
                getPriorityLabel(item.priority || 2)
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

        return doc;
    };

    const exportReport = async (type: 'daily' | 'tasks', filters: ReportFilters) => {
        try {
            setLoading(true);
            const doc = await createPdfDocument(type, filters);
            doc.save(`report_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
            return { success: true };
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.message || 'Failed to export report';
            setError(errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const silentPrintReport = async (type: 'daily' | 'tasks', filters: ReportFilters) => {
        try {
            setLoading(true);
            const doc = await createPdfDocument(type, filters);

            // Auto print magic
            doc.autoPrint();

            // Create hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.width = '0px';
            iframe.style.height = '0px';
            iframe.style.border = 'none';
            iframe.style.visibility = 'hidden'; // Don't use display:none, some browsers won't print

            document.body.appendChild(iframe);

            // Set source
            iframe.src = doc.output('bloburl').toString();

            // Wait for load then print
            // Small delay to ensure blob is ready to interact
            setTimeout(() => {
                // Focus required for some browsers
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                // Cleanup after a while
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 60000); // 1 minute cleanup
            }, 100);

            return { success: true };
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.message || 'Failed to print report';
            setError(errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async (type: 'daily' | 'tasks', filters: ReportFilters) => {
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
                const msg = "No data available to export";
                setError(msg);
                toast.error(msg);
                return { success: false, error: msg };
            }

            // Map data for Excel
            let excelData = [];
            if (type === 'daily') {
                excelData = data.map((item: any) => ({
                    'Code': item.task_code || '-',
                    'Task Name': item.task_name || '-',
                    'Project': item.project_name || '-',
                    'Module': item.module_name || '-',
                    'Assigned To': item.assigned_to || '-',
                    'Priority': getPriorityLabel(item.priority || 2)
                }));
            } else {
                excelData = data.map((item: any) => ({
                    'Code': item.task_code || '-',
                    'Task Name': item.task_name || '-',
                    'Project': item.project_name || '-',
                    'Assigned To': item.assigned_to || '-',
                    'Status': item.status || '-',
                    'Date': item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'
                }));
            }

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, "Report");

            // Save file
            const fileName = `report_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            return { success: true };
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.message || 'Failed to export excel';
            setError(errorMsg);
            toast.error(errorMsg);
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
        silentPrintReport,
        exportToExcel,
    };
}
