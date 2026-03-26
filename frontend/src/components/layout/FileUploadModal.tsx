import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface FileUploadModalProps {
    onClose: () => void;
    onUpload: (files: File[]) => void;
}

const FileUploadModal = ({ onClose, onUpload }: FileUploadModalProps) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    };
    const removeFile = (index: number) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    const handleUpload = () => {
        if (selectedFiles.length > 0) { onUpload(selectedFiles); onClose(); }
    };
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Upload Audit Documents</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Governance policies, model artifacts, security docs</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Drop zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
              ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                    >
                        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop files here</p>
                        <p className="text-xs text-gray-400 mb-4">PDF, DOC, DOCX, TXT, CSV, JSON, XLSX</p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            Browse Files
                            <input type="file" multiple onChange={handleFileSelect} className="hidden"
                                accept=".pdf,.doc,.docx,.txt,.csv,.json,.xml,.xlsx,.xls" />
                        </label>
                    </div>

                    {/* File list */}
                    {selectedFiles.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-600 mb-2">
                                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                            </p>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {selectedFiles.map((file, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                                        <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                                            <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                                        </div>
                                        <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <p className="text-xs text-gray-400">
                        {selectedFiles.length === 0 ? 'No files selected' : `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} ready`}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={selectedFiles.length === 0}
                            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-1.5"
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Upload & Audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUploadModal;