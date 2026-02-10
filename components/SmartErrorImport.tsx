
import React, { useState, useEffect } from 'react';
import { analyzeFileContent } from './AIService';
import { errorService } from '../services/errorService';
import { extractDriveFileId, getDriveImageLink, isValidDriveLink } from '../utils/googleDriveUtils';
import { brandService } from '../services/brandService';
import { Brand } from '../types';

interface ExtractedData {
    code: string;
    title: string;
    brand: string;
    model_series: string;
    symptom: string;
    cause: string;
    steps: string[];
    components: string[];
    tools: string[];
    images: string[];
    videos?: string[];
    confidence?: number;
}

const SmartErrorImport: React.FC = () => {
    // State for Wizard Steps
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Brand Data
    const [brands, setBrands] = useState<Brand[]>([]);

    // Recent Imports History
    const [recentImports, setRecentImports] = useState<any[]>([]);

    useEffect(() => {
        const loadBrands = async () => {
            const data = await brandService.getBrands();
            setBrands(data);
        };
        loadBrands();
    }, []);

    // Step 1: Context
    const [contextData, setContextData] = useState({
        brand: '',
        model_series: '',
    });

    // Step 2: Upload & AI
    const [file, setFile] = useState<File | null>(null);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Step 3: Validation
    const [extractedData, setExtractedData] = useState<ExtractedData>({
        code: '',
        title: '',
        brand: '',
        model_series: '',
        symptom: '',
        cause: '',
        steps: [],
        components: [],
        tools: [],
        images: [],
        videos: [],
        confidence: 0
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreviewUrl(URL.createObjectURL(f));
        }
    };

    const handleAnalyze = async () => {
        if (!file || !contextData.brand) return;
        setIsAiProcessing(true);

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const contextPrompt = `${contextData.brand} ${contextData.model_series}`;

                // Call AI Service
                const result = await analyzeFileContent(base64, file.type, contextPrompt);

                // Map result to state
                setExtractedData({
                    code: result.code || '',
                    title: result.title || '',
                    brand: contextData.brand, // Enforce selected brand
                    model_series: contextData.model_series, // Enforce selected model
                    symptom: result.symptom || '',
                    cause: result.cause || '',
                    steps: result.steps || [],
                    components: result.components || [],
                    tools: result.tools || [],
                    images: [], // Placeholder for standard logic
                    confidence: result.confidence || 0
                });

                setStep(3); // Move to Validation
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("AI Error:", error);
            alert("Lỗi khi phân tích tài liệu. Vui lòng thử lại.");
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleSave = async () => {
        try {
            const newError: any = {
                ...extractedData,
                model: extractedData.model_series || 'All Models',
                status: 'active',
                severity: 'medium',
                isCommon: false,
                components: extractedData.components.filter(c => c),
                tools: extractedData.tools.filter(t => t),
                steps: extractedData.steps.filter(s => s),
                images: extractedData.images.filter(i => i),
                videos: extractedData.videos?.filter(v => v) || [],
                updatedAt: new Date().toISOString()
            };

            await errorService.createError(newError);
            alert(`Đã lưu mã lỗi ${extractedData.code} thành công!`);
            
            // Add to history
            setRecentImports(prev => [newError, ...prev]);

            // Reset flow
            setStep(1);
            setFile(null);
            setPreviewUrl(null);
        } catch (e) {
            console.error("Save failed", e);
            alert("Lỗi khi lưu vào database.");
        }
    };

    // Helper to handle image replacement
    const handleImageLinkChange = (index: number, value: string) => {
        const newImages = [...extractedData.images];
        // If it's a valid drive link, convert it immediately for preview
        if (isValidDriveLink(value)) {
            const fileId = extractDriveFileId(value);
            if (fileId) {
                newImages[index] = getDriveImageLink(fileId);
            }
        } else {
            newImages[index] = value;
        }
        setExtractedData(prev => ({ ...prev, images: newImages }));
    };

    const addDriveImage = () => {
        setExtractedData(prev => ({ ...prev, images: [...prev.images, ''] })); // Add empty slot for link
    };

    return (
        <div className="h-full flex flex-col bg-background-dark p-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Nhập liệu Thông minh (AI Smart Import)</h1>
                <p className="text-text-secondary">Quy trình chuẩn hóa dữ liệu từ tài liệu kỹ thuật & hình ảnh thực tế</p>

                {/* Steps Indicator */}
                <div className="flex items-center gap-4 mt-6">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-gray-600'}`}>
                        <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">1</span>
                        <span className="font-bold">Chọn Ngữ cảnh</span>
                    </div>
                    <div className="w-12 h-px bg-gray-700"></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-gray-600'}`}>
                        <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">2</span>
                        <span className="font-bold">AI Phân tích</span>
                    </div>
                    <div className="w-12 h-px bg-gray-700"></div>
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-gray-600'}`}>
                        <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">3</span>
                        <span className="font-bold">Kiểm tra & Lưu</span>
                    </div>
                </div>
            </div>

            {/* Step 1: Context Selection */}
            {step === 1 && (
                <div className="bg-surface-dark p-8 rounded-2xl border border-border-dark/30 max-w-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Bước 1: Xác định thiết bị</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-2 uppercase">Hãng sản xuất</label>
                            <select
                                value={contextData.brand}
                                onChange={(e) => setContextData({ ...contextData, brand: e.target.value })}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none appearance-none"
                            >
                                <option value="">-- Chọn Hãng --</option>
                                {brands.map((b) => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-2 uppercase">Dòng máy / Model Series (Tùy chọn)</label>
                            <input
                                type="text"
                                placeholder="VD: VRV IV, SkyAir, Inverter..."
                                value={contextData.model_series}
                                onChange={(e) => setContextData({ ...contextData, model_series: e.target.value })}
                                className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={() => contextData.brand ? setStep(2) : alert('Vui lòng nhập tên Hãng')}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Upload & AI Analysis */}
            {step === 2 && (
                <div className="bg-surface-dark p-8 rounded-2xl border border-border-dark/30 max-w-4xl flex gap-8">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-6">Bước 2: Tải lên tài liệu</h2>
                        <div className="border-2 border-dashed border-border-dark rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer bg-background-dark/30 h-64 relative">
                            <input
                                data-testid="file-upload-input"
                                type="file"
                                onChange={handleFileSelect}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*,application/pdf"
                            />
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="h-full object-contain rounded-lg" />
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-4xl text-gray-500 mb-2">cloud_upload</span>
                                    <p className="text-gray-400 font-medium">Kéo thả ảnh chụp hoặc PDF vào đây</p>
                                    <p className="text-xs text-gray-600 mt-2">Hỗ trợ JPG, PNG, PDF</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="w-80 border-l border-border-dark pl-8 flex flex-col justify-center">
                        <div className="bg-background-dark p-4 rounded-xl mb-4">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Đang xử lý cho:</p>
                            <p className="text-lg font-bold text-white">{contextData.brand}</p>
                            <p className="text-sm text-primary">{contextData.model_series}</p>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={!file || isAiProcessing}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isAiProcessing
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-linear-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/30'
                                }`}
                        >
                            {isAiProcessing ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                    Đang phân tích...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Bắt đầu AI Phân tích
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setExtractedData(prev => ({
                                    ...prev,
                                    brand: contextData.brand,
                                    model_series: contextData.model_series
                                }));
                                setStep(3);
                            }}
                            className="mt-3 w-full py-3 rounded-xl font-bold bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">edit_note</span>
                            Nhập thủ công (Bỏ qua AI)
                        </button>

                        <button onClick={() => setStep(1)} className="mt-4 text-text-secondary text-sm hover:text-white underline">Quay lại Bước 1</button>
                    </div>
                </div>
            )}

            {/* Step 3: Validation & Edit */}
            {step === 3 && (
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-white">Bước 3: Kiểm tra & Hiệu chỉnh</h2>
                            {extractedData.confidence !== undefined && (
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                    (extractedData.confidence || 0) > 80 ? 'bg-green-500/20 text-green-400' :
                                    (extractedData.confidence || 0) > 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    AI Confidence: {extractedData.confidence}%
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(2)} className="px-6 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600">Phân tích lại</button>
                            <button onClick={handleSave} className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 shadow-lg shadow-green-600/20 flex items-center gap-2">
                                <span className="material-symbols-outlined">check_circle</span>
                                Xác nhận & Lưu
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
                        {/* Preview Panel */}
                        <div className="bg-black/40 rounded-2xl border border-border-dark/30 p-4 flex items-center justify-center overflow-auto">
                            {previewUrl && (
                                file?.type === 'application/pdf' ? (
                                    <iframe src={previewUrl} className="w-full h-full rounded-lg shadow-2xl min-h-[500px]" />
                                ) : (
                                    <img src={previewUrl} className="max-w-full max-h-full rounded-lg shadow-2xl" />
                                )
                            )}
                        </div>

                        {/* Edit Form */}
                        <div className="bg-surface-dark rounded-2xl border border-border-dark/30 p-6 overflow-y-auto custom-scroll space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Mã lỗi</label>
                                    <input value={extractedData.code} onChange={e => setExtractedData({ ...extractedData, code: e.target.value })} className="w-full bg-background-dark p-3 rounded-lg text-white font-bold border border-border-dark focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Tên lỗi</label>
                                    <input value={extractedData.title} onChange={e => setExtractedData({ ...extractedData, title: e.target.value })} className="w-full bg-background-dark p-3 rounded-lg text-white border border-border-dark focus:border-primary" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Nguyên nhân (Chi tiết)</label>
                                <textarea rows={3} value={extractedData.cause} onChange={e => setExtractedData({ ...extractedData, cause: e.target.value })} className="w-full bg-background-dark p-3 rounded-lg text-white border border-border-dark focus:border-primary resize-none" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Các bước khắc phục</label>
                                <div className="space-y-2 mt-2">
                                    {extractedData.steps.map((step, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="w-6 h-6 rounded bg-gray-700 text-white flex items-center justify-center text-xs shrink-0">{idx + 1}</span>
                                            <input
                                                value={step}
                                                onChange={e => {
                                                    const newSteps = [...extractedData.steps];
                                                    newSteps[idx] = e.target.value;
                                                    setExtractedData({ ...extractedData, steps: newSteps });
                                                }}
                                                className="flex-1 bg-transparent border-b border-border-dark text-white text-sm focus:border-primary outline-none py-1"
                                            />
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setExtractedData({ ...extractedData, steps: [...extractedData.steps, ''] })}
                                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span> Thêm bước
                                    </button>
                                </div>
                            </div>

                            {/* Images Section with Drive Support */}
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase flex justify-between items-center">
                                    Hình ảnh minh họa
                                    <button onClick={addDriveImage} className="text-primary hover:text-white flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">add_link</span>
                                        Thêm Link Google Drive
                                    </button>
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                    {extractedData.images.map((img, i) => (
                                        <div key={i} className="relative group bg-black/20 rounded-xl p-2 border border-border-dark">
                                            {/* Preview */}
                                            <div className="aspect-square rounded-lg overflow-hidden bg-black/40 mb-2 relative">
                                                {img ? (
                                                    <img src={img} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Error')} />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-600">
                                                        <span className="material-symbols-outlined">image</span>
                                                    </div>
                                                )}
                                                {img.includes('googleusercontent') && <div className="absolute top-1 right-1 bg-green-500 text-white text-[8px] font-bold px-1 rounded">DRIVE</div>}
                                            </div>

                                            {/* Input for Link */}
                                            <input
                                                type="text"
                                                placeholder="Paste Drive Link..."
                                                value={img.startsWith('data:') ? '(AI Image)' : img}
                                                onChange={(e) => handleImageLinkChange(i, e.target.value)}
                                                className="w-full bg-background-dark text-[10px] text-white p-1 rounded border border-border-dark focus:border-primary outline-none"
                                            />

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => setExtractedData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
                                            >
                                                <span className="material-symbols-outlined text-xs">close</span>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Capture Button (Preserved) */}
                                    {/* Capture Button (Upgraded to Local Upload) */}
                                    <div className="relative aspect-square border-2 border-dashed border-border-dark rounded-xl flex flex-col items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all bg-background-dark/30 cursor-pointer overflow-hidden group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                                            title="Tải ảnh lên từ máy"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => {
                                                        const result = ev.target?.result as string;
                                                        setExtractedData(prev => ({ ...prev, images: [...prev.images, result] }));
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">add_photo_alternate</span>
                                        <span className="text-[8px] font-bold mt-1 uppercase text-center group-hover:text-white">Tải ảnh lên<br />(Local)</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 italic">
                                    * Mẹo: Dán link chia sẻ Google Drive vào ô nhập để tiết kiệm dung lượng database.
                                </p>
                            </div>

                            {/* Video Inputs (Multiple) */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase flex justify-between items-center">
                                    Video hướng dẫn (YouTube)
                                    <button
                                        onClick={() => setExtractedData({ ...extractedData, videos: [...(extractedData.videos || []), ''] })}
                                        className="text-primary hover:text-white flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">add_circle</span>
                                        Thêm Video
                                    </button>
                                </label>
                                <div className="space-y-4 mt-2">
                                    {(extractedData.videos?.length ? extractedData.videos : ['']).map((videoUrl, idx) => (
                                        <div key={idx} className="flex gap-4 p-3 bg-background-dark/30 rounded-xl border border-border-dark/30">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex gap-2">
                                                    <span className="w-6 h-6 rounded bg-red-500/10 text-red-500 flex items-center justify-center text-xs shrink-0 font-bold border border-red-500/20">{idx + 1}</span>
                                                    <input
                                                        value={videoUrl}
                                                        onChange={e => {
                                                            const newVideos = [...(extractedData.videos || [])];
                                                            // Ensure array has enough slots if we started with empty default
                                                            if (newVideos.length <= idx) newVideos.push('');
                                                            newVideos[idx] = e.target.value;
                                                            setExtractedData({ ...extractedData, videos: newVideos });
                                                        }}
                                                        className="flex-1 bg-transparent border-b border-border-dark text-white text-sm focus:border-red-500 outline-none py-1 placeholder:text-gray-700"
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                    />
                                                    {/* Remove Button */}
                                                    {(extractedData.videos?.length || 0) > 0 && (
                                                        <button
                                                            onClick={() => {
                                                                const newVideos = extractedData.videos?.filter((_, i) => i !== idx);
                                                                setExtractedData({ ...extractedData, videos: newVideos });
                                                            }}
                                                            className="text-gray-500 hover:text-red-500"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Helper Text */}
                                                {idx === 0 && (
                                                    <p className="text-[10px] text-gray-500 italic pl-8">
                                                        * Hỗ trợ link YouTube, YouTube Short. Video sẽ phát trực tiếp trên App.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Preview Thumbnail */}
                                            {videoUrl && (
                                                <div className="w-32 aspect-video bg-black rounded-lg overflow-hidden border border-border-dark relative shrink-0">
                                                    {(() => {
                                                        const getYouTubeId = (url: string) => {
                                                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                                            const match = url?.match(regExp);
                                                            return (match && match[2].length === 11) ? match[2] : null;
                                                        };
                                                        const videoId = getYouTubeId(videoUrl);
                                                        return videoId ? (
                                                            <img
                                                                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                                                className="w-full h-full object-cover opacity-80"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-red-500/50 text-[10px] text-center">Invalid</div>
                                                        );
                                                    })()}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white drop-shadow-md">play_circle</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase flex justify-between">
                                        Linh kiện liên quan
                                        <button
                                            onClick={() => setExtractedData({ ...extractedData, components: [...extractedData.components, ''] })}
                                            className="text-primary hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {extractedData.components.map((comp, i) => (
                                            <div key={i} className="flex items-center bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-1">
                                                <input
                                                    value={comp}
                                                    onChange={(e) => {
                                                        const newComps = [...extractedData.components];
                                                        newComps[i] = e.target.value;
                                                        setExtractedData({ ...extractedData, components: newComps });
                                                    }}
                                                    className="bg-transparent text-blue-400 text-xs w-24 outline-none"
                                                    placeholder="Nhập tên..."
                                                />
                                                <button
                                                    onClick={() => setExtractedData({ ...extractedData, components: extractedData.components.filter((_, idx) => idx !== i) })}
                                                    className="ml-1 text-blue-500/50 hover:text-red-500"
                                                >
                                                    <span className="material-symbols-outlined text-[10px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase flex justify-between">
                                        Công cụ cần thiết
                                        <button
                                            onClick={() => setExtractedData({ ...extractedData, tools: [...extractedData.tools, ''] })}
                                            className="text-primary hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {extractedData.tools.map((tool, i) => (
                                            <div key={i} className="flex items-center bg-orange-500/10 border border-orange-500/20 rounded-lg px-2 py-1">
                                                <input
                                                    value={tool}
                                                    onChange={(e) => {
                                                        const newTools = [...extractedData.tools];
                                                        newTools[i] = e.target.value;
                                                        setExtractedData({ ...extractedData, tools: newTools });
                                                    }}
                                                    className="bg-transparent text-orange-400 text-xs w-24 outline-none"
                                                    placeholder="Nhập tên..."
                                                />
                                                <button
                                                    onClick={() => setExtractedData({ ...extractedData, tools: extractedData.tools.filter((_, idx) => idx !== i) })}
                                                    className="ml-1 text-orange-500/50 hover:text-red-500"
                                                >
                                                    <span className="material-symbols-outlined text-[10px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Imports History Section */}
            {recentImports.length > 0 && (
                <div className="mt-8 border-t border-gray-800 pt-6">
                    <h3 className="text-lg font-bold text-white mb-4">Các mã lỗi vừa thêm</h3>
                    <div className="bg-surface-dark border border-gray-800 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left text-gray-400">
                             <thead className="bg-[#1a1f2e] text-xs uppercase font-bold text-gray-300">
                                <tr>
                                    <th className="px-6 py-3">Mã lỗi</th>
                                    <th className="px-6 py-3">Tên lỗi</th>
                                    <th className="px-6 py-3">Model</th>
                                    <th className="px-6 py-3">Hãng</th>
                                    <th className="px-6 py-3">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentImports.map((imp, idx) => (
                                    <tr key={idx} className="border-b border-gray-800 hover:bg-white/5">
                                        <td className="px-6 py-4 font-medium text-white">{imp.code}</td>
                                        <td className="px-6 py-4">{imp.title}</td>
                                        <td className="px-6 py-4">{imp.model}</td>
                                        <td className="px-6 py-4">{imp.brand}</td>
                                        <td className="px-6 py-4">{new Date().toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartErrorImport;
