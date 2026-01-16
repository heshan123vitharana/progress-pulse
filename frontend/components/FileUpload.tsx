'use client';
import { useState } from 'react';
import api from '@/lib/api';

interface FileUploadProps {
    taskId: number;
    onUploadComplete?: () => void;
}

export default function FileUpload({ taskId, onUploadComplete }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<any[]>([]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        formData.append('task_id', taskId.toString());

        try {
            await api.post('/task-attachments', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            await fetchFiles();
            onUploadComplete?.();
        } catch (err) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const fetchFiles = async () => {
        try {
            const res = await api.get(`/tasks/${taskId}/attachments`);
            setFiles(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (err) { }
    };

    const deleteFile = async (id: number) => {
        if (confirm('Delete file?')) {
            await api.delete(`/task-attachments/${id}`);
            await fetchFiles();
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Upload File</label>
                <input type="file" onChange={handleUpload} disabled={uploading} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map(f => (
                        <div key={f.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{f.filename}</span>
                            <button onClick={() => deleteFile(f.id)} className="text-red-600 text-sm">Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
