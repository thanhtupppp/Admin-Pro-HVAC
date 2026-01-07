import React, { useState, useRef } from 'react';
import { aiImportService, ExtractedData } from '../services/aiImportService';

interface AISmartImportProps {
    onImportComplete?: (data: any) => void;
}

const AISmartImport: React.FC<AISmartImportProps> = ({ onImportComplete }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);

        // Preview first file
        if (files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    setPreviewUrl(e.target.result);
                }
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (selectedFiles.length === 0) {
            alert('Vui lòng chọn ít nhất 1 file');
            return;
        }

        setIsAnalyzing(true);
        try {
            const data = await aiImportService.extractFromImage(selectedFiles[0]);
            setExtractedData(data);
        } catch (error) {
            console.error('AI analysis failed', error);
            alert('Không thể phân tích file. Vui lòng thử lại.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFillField = (field: string, value: string) => {
        // This would integrate with your form
        console.log(`Auto-fill: ${field} = ${value}`);
        if (onImportComplete) {
            onImportComplete({ [field]: value });
        }
    };

    const handleFillAll = () => {
        if (extractedData && onImportComplete) {
            const formData: Record<string, string> = {};
            Object.entries(extractedData.fields).forEach(([key, field]: [string, any]) => {
                formData[key] = field.value;
            });
            onImportComplete(formData);
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.9) return 'text-green-400 bg-green-500/10';
        if (confidence >= 0.7) return 'text-yellow-400 bg-yellow-500/10';
        return 'text-red-400 bg-red-500/10';
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">AI Smart Import</h1>
                    <p className="text-text-secondary">
                        Upload ảnh chụp error code hoặc tài liệu kỹ thuật để AI tự động trích xuất thông tin
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Hỗ trợ: JPG, PNG, PDF
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Upload & Preview */}
                <div className="space-y-4">
                    {/* Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border-dark rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-all bg-surface-dark"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {selectedFiles.length === 0 ? (
                            <div className="space-y-4">
                                <div className="text-6xl">📤</div>
                                <div>
                                    <p className="text-white font-medium mb-1">
                                        Click để chọn file hoặc kéo thả vào đây
                                    </p>
                                    <p className="text-text-secondary text-sm">
                                        Hỗ trợ nhiều file cùng lúc (batch import)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="text-4xl text-green-400">✓</div>
                                <div>
                                    <p className="text-white font-medium">
                                        {selectedFiles.length} file đã chọn
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        {selectedFiles.map((file, idx) => (
                                            <p key={idx} className="text-text-secondary text-xs truncate">
                                                {file.name}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFiles([]);
                                        setPreviewUrl('');
                                        setExtractedData(null);
                                    }}
                                    className="text-red-400 text-sm hover:underline"
                                >
                                    Xóa và chọn lại
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {previewUrl && (
                        <div className="bg-surface-dark border border-border-dark rounded-2xl p-4">
                            <h3 className="text-sm font-bold text-white mb-3">Preview</h3>
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-auto rounded-lg"
                                />
                                {extractedData && extractedData.boundingBoxes && (
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        {extractedData.boundingBoxes.map((box, idx) => (
                                            <rect
                                                key={idx}
                                                x={`${box.x}%`}
                                                y={`${box.y}%`}
                                                width={`${box.width}%`}
                                                height={`${box.height}%`}
                                                fill="none"
                                                stroke={box.field === selectedField ? '#1a73e8' : '#34a853'}
                                                strokeWidth="2"
                                                className={box.field === selectedField ? 'animate-pulse' : ''}
                                            />
                                        ))}
                                    </svg>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Analyze Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={selectedFiles.length === 0 || isAnalyzing}
                        className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Đang phân tích bằng AI...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">auto_awesome</span>
                                Phân tích với AI
                            </>
                        )}
                    </button>
                </div>

                {/* Right: Extracted Data */}
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Dữ liệu trích xuất</h3>
                        {extractedData && (
                            <button
                                onClick={handleFillAll}
                                className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-medium rounded-lg transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">done_all</span>
                                Điền tất cả
                            </button>
                        )}
                    </div>

                    {!extractedData ? (
                        <div className="text-center py-16 text-text-secondary">
                            <div className="text-5xl mb-4">🤖</div>
                            <p>Upload và phân tích file để xem kết quả</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(extractedData.fields).map(([key, field]: [string, any]) => (
                                <div
                                    key={key}
                                    onMouseEnter={() => setSelectedField(key)}
                                    onMouseLeave={() => setSelectedField(null)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedField === key
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border-dark bg-background-dark/50 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-text-secondary uppercase">
                                                    {field.label}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-mono ${getConfidenceColor(field.confidence)}`}>
                                                    {(field.confidence * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="text-white font-medium">
                                                {field.value || '—'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleFillField(key, field.value)}
                                            className="text-primary hover:text-primary-hover transition-colors"
                                            title="Điền vào form"
                                        >
                                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                        </button>
                                    </div>

                                    {field.confidence < 0.7 && (
                                        <div className="text-xs text-yellow-400 flex items-center gap-1 mt-2">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            Độ tin cậy thấp - vui lòng kiểm tra lại
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                    Mẹo để có kết quả tốt nhất
                </h4>
                <ul className="space-y-1 text-xs text-text-secondary">
                    <li>• Chụp ảnh rõ nét, tránh mờ hoặc nghiêng</li>
                    <li>• Đảm bảo đủ ánh sáng, không bóng che</li>
                    <li>• Upload ảnh gốc thay vì ảnh chụp màn hình</li>
                    <li>• Với PDF, chọn file có thể search text</li>
                </ul>
            </div>
        </div>
    );
};

export default AISmartImport;
