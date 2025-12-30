import React, { useState, useRef } from 'react';
import { importService } from '../services/importService';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type: 'users' | 'errors';
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess, type }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setIsLoading(true);
        try {
            let importResult;
            if (type === 'users') {
                importResult = await importService.importUsers(file);
            } else {
                importResult = await importService.importErrorCodes(file);
            }
            setResult(importResult);
            if (importResult.success > 0) {
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            alert('Import failed: ' + error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        if (type === 'users') {
            importService.downloadUserTemplate();
        } else {
            importService.downloadErrorTemplate();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-2xl border border-gray-800 shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div>
                        <h3 className="text-xl font-bold text-white">Import {type === 'users' ? 'Users' : 'Error Codes'} via CSV</h3>
                        <p className="text-sm text-gray-400 mt-1">Upload a CSV file to bulk create records</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-400 text-sm">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* File Upload Area */}
                    {!result && (
                        <div className="space-y-4">
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file ? 'border-primary bg-primary/5' : 'border-gray-700 hover:border-gray-500 hover:bg-white/5'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".csv"
                                    className="hidden"
                                />
                                <div className="w-16 h-16 rounded-full bg-surface-dark mx-auto flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl text-primary">upload_file</span>
                                </div>
                                {file ? (
                                    <div>
                                        <p className="text-white font-medium">{file.name}</p>
                                        <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-white font-medium">Click to upload or drag & drop</p>
                                        <p className="text-sm text-gray-400 mt-1">CSV files only</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Download Template
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Area */}
                    {result && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-green-500">{result.success}</p>
                                    <p className="text-xs text-green-400 uppercase tracking-wider font-bold">Successful</p>
                                </div>
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-red-500">{result.failed}</p>
                                    <p className="text-xs text-red-400 uppercase tracking-wider font-bold">Failed</p>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="bg-surface-dark border border-gray-800 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                                        Error Log
                                    </h4>
                                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {result.errors.map((err, index) => (
                                            <div key={index} className="text-xs text-red-400 bg-red-500/5 p-2 rounded border border-red-500/10">
                                                {err}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                    >
                        {result ? 'Close' : 'Cancel'}
                    </button>
                    {!result ? (
                        <button
                            onClick={handleImport}
                            disabled={!file || isLoading}
                            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                            Import Now
                        </button>
                    ) : (
                        <button
                            onClick={() => { setFile(null); setResult(null); }}
                            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            Import Another
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
