
import React, { useState, useRef, useEffect } from 'react';
import { analyzeFileContent } from './AIService';

interface BatchDoc {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  size: string;
  file?: File;
}

// Added onSave to props interface to fix type error in App.tsx
interface OCRToolProps {
  onSave?: () => void;
}

const OCRTool: React.FC<OCRToolProps> = ({ onSave }) => {
  const [tab, setTab] = useState(0); 
  const [docs, setDocs] = useState<BatchDoc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [extractedData, setExtractedData] = useState({
    code: '',
    title: '',
    symptom: '',
    cause: '',
    steps: [] as string[],
    images: [] as string[] // Lưu trữ các base64 ảnh trích xuất
  });

  const selectedDoc = docs.find(d => d.id === selectedDocId);

  // Xử lý hiển thị PDF khi chọn tài liệu
  useEffect(() => {
    if (selectedDoc?.file && selectedDoc.file.type === 'application/pdf' && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
        const pdf = await (window as any).pdfjsLib.getDocument(typedarray).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
      };
      reader.readAsArrayBuffer(selectedDoc.file);
    }
  }, [selectedDocId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDocs = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      status: 'pending' as const,
      progress: 0,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      file: file
    }));

    setDocs(prev => [...prev, ...newDocs]);
    if (!selectedDocId) setSelectedDocId(newDocs[0].id);
  };

  const handleAiRefine = async () => {
    if (!selectedDoc?.file) return;
    setIsAiProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeFileContent(base64, selectedDoc.file!.type);
        
        setExtractedData({
          code: result.code || '',
          title: result.title || '',
          symptom: result.symptom || '',
          cause: result.cause || '',
          steps: result.steps || [],
          images: extractedData.images
        });
        
        setDocs(prev => prev.map(d => d.id === selectedDocId ? { ...d, status: 'done', progress: 100 } : d));
      };
      reader.readAsDataURL(selectedDoc.file);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const captureImageFromPdf = () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL('image/png');
      setExtractedData(prev => ({
        ...prev,
        images: [...prev.images, imageData]
      }));
    }
  };

  return (
    <div className="h-full flex flex-col bg-background-dark overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-border-dark/30 flex items-center justify-between bg-surface-dark/50 backdrop-blur shrink-0 z-20">
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept=".pdf,image/*" 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Tải lên PDF/Ảnh
          </button>
        </div>
        
        <div className="flex h-10 items-center rounded-xl bg-background-dark p-1 border border-border-dark/50">
          {['Tài liệu', 'Soạn thảo', 'Trích xuất'].map((label, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                tab === i ? 'bg-surface-dark text-white shadow-md' : 'text-text-secondary hover:text-white'
              }`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
           <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">AI Multimodal: Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-72 border-r border-border-dark/30 bg-surface-dark/20 flex flex-col shrink-0">
          <div className="p-4 border-b border-border-dark/30 bg-background-dark/30 flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Danh sách tệp ({docs.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
            {docs.length === 0 && (
              <div className="text-center py-10 opacity-30">
                <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                <p className="text-[10px] mt-2 font-bold uppercase">Chưa có tệp</p>
              </div>
            )}
            {docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all group ${
                  selectedDocId === doc.id 
                  ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' 
                  : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    doc.status === 'done' ? 'bg-green-500/10 text-green-500' :
                    doc.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {doc.file?.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${selectedDocId === doc.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      {doc.name}
                    </p>
                    <p className="text-[9px] text-text-secondary">{doc.size}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          {/* Document Preview */}
          <div className="border-r border-border-dark/30 flex flex-col bg-black/40 overflow-auto p-4 custom-scroll relative">
             <div className="sticky top-0 right-0 z-10 flex justify-end mb-2">
                <button 
                  onClick={captureImageFromPdf}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur border border-white/10 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">content_cut</span>
                  Trích xuất hình ảnh vùng này
                </button>
             </div>
             <div className="flex justify-center bg-white/5 p-4 rounded-xl min-h-[800px]">
                {selectedDoc?.file?.type === 'application/pdf' ? (
                  <canvas ref={canvasRef} className="shadow-2xl max-w-full" />
                ) : selectedDoc?.file?.type.startsWith('image/') ? (
                   <img 
                    src={URL.createObjectURL(selectedDoc.file)} 
                    alt="Preview" 
                    className="max-w-full object-contain shadow-2xl rounded-lg"
                   />
                ) : (
                  <div className="flex flex-col items-center justify-center text-text-secondary h-full">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">description</span>
                    <p className="text-sm font-medium">Chọn một tệp để xem trước</p>
                  </div>
                )}
             </div>
          </div>

          {/* Editor Area */}
          <div className="flex flex-col bg-background-dark overflow-y-auto custom-scroll">
            <div className="p-6 space-y-6 pb-32">
              <section className="bg-surface-dark border border-border-dark/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-6 border-b border-border-dark/30 pb-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">psychology</span>
                    AI Phân tích Multimodal
                  </h3>
                  <button 
                    onClick={handleAiRefine}
                    disabled={isAiProcessing || !selectedDoc}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isAiProcessing 
                      ? 'bg-primary/20 text-primary cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isAiProcessing ? 'animate-spin' : ''}`}>
                      {isAiProcessing ? 'sync' : 'auto_awesome'}
                    </span>
                    {isAiProcessing ? 'AI Đang đọc tài liệu...' : 'Đọc tệp bằng AI'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Mã lỗi & Tiêu đề</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="E..." value={extractedData.code} onChange={e => setExtractedData({...extractedData, code: e.target.value})} className="w-24 bg-background-dark border-border-dark rounded-xl px-4 py-3 text-white font-bold" />
                      <input type="text" placeholder="Tên lỗi trích xuất" value={extractedData.title} onChange={e => setExtractedData({...extractedData, title: e.target.value})} className="flex-1 bg-background-dark border-border-dark rounded-xl px-4 py-3 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Triệu chứng (AI Phân tích)</label>
                    <textarea rows={3} value={extractedData.symptom} onChange={e => setExtractedData({...extractedData, symptom: e.target.value})} className="w-full bg-background-dark border-border-dark rounded-xl px-4 py-3 text-xs text-white resize-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Hình ảnh trích xuất ({extractedData.images.length})</label>
                    <div className="flex flex-wrap gap-3">
                       {extractedData.images.map((img, i) => (
                         <div key={i} className="relative group/img">
                            <img src={img} className="w-24 h-24 object-cover rounded-xl border border-border-dark shadow-lg" />
                            <button 
                              onClick={() => setExtractedData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg"
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                         </div>
                       ))}
                       <button 
                        onClick={captureImageFromPdf}
                        className="w-24 h-24 border-2 border-dashed border-border-dark rounded-xl flex flex-col items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all bg-background-dark/30"
                       >
                         <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                         <span className="text-[8px] font-bold mt-1 uppercase">Chụp PDF</span>
                       </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Các bước khắc phục (AI trích xuất)</label>
                    <div className="space-y-3">
                      {extractedData.steps.map((step, i) => (
                        <div key={i} className="flex gap-3 items-start bg-background-dark/50 p-4 rounded-xl border border-border-dark/30">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                          <textarea rows={1} value={step} onChange={e => {
                            const newSteps = [...extractedData.steps];
                            newSteps[i] = e.target.value;
                            setExtractedData({...extractedData, steps: newSteps});
                          }} className="flex-1 bg-transparent border-none p-0 text-[11px] text-white focus:ring-0 resize-none h-auto" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-dark/95 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-10 z-50">
        <div className="flex flex-col">
           <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Database Sync</span>
           <p className="text-xs text-white font-medium">Sẵn sàng lưu {extractedData.images.length} hình ảnh & dữ liệu mã lỗi</p>
        </div>
        <div className="h-8 w-px bg-border-dark"></div>
        {/* Added onSave call to sync with App state */}
        <button 
          onClick={onSave}
          className="px-8 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
          Phê duyệt & Lưu vào App
        </button>
      </div>
    </div>
  );
};

export default OCRTool;
