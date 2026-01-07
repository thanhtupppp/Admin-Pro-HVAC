import React, { useState, useEffect } from 'react';
import { errorService } from '../services/errorService';
import { ErrorCode } from '../types';
import { useDebounce } from '../utils/hooks';

interface ErrorEditProps {
  errorId?: string;
  onCancel: () => void;
  onSave?: () => void;
}

const ErrorEdit: React.FC<ErrorEditProps> = ({ errorId, onCancel, onSave }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<ErrorCode | null>(null);

  // Autocomplete data
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    brand: '',
    model: '',
    title: '',
    symptom: '',
    cause: '',
    steps: ['', '', ''] as string[],
    components: [] as string[],
    tools: [] as string[],
    videos: [] as string[],
    status: 'active',
    severity: 'medium',
    isCommon: false,
  });

  // Debounced form data for autosave
  const debouncedFormData = useDebounce(formData, 3000);

  // Load error data
  useEffect(() => {
    const loadError = async () => {
      if (!errorId) {
        setIsLoading(false);
        return;
      }
      try {
        const errorData = await errorService.getErrorById(errorId);
        if (errorData) {
          setError(errorData);
          setFormData({
            code: errorData.code || '',
            brand: errorData.brand || '',
            model: errorData.model || '',
            title: errorData.title || '',
            symptom: errorData.symptom || '',
            cause: errorData.cause || '',
            steps: errorData.steps?.length > 0 ? errorData.steps : ['', '', ''],
            components: errorData.components || [],
            tools: errorData.tools || [],
            videos: errorData.videos || [],
            status: errorData.status || 'active',
            severity: errorData.severity || 'medium',
            isCommon: errorData.isCommon || false,
          });
        }
      } catch (err) {
        console.error('Failed to load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadError();
  }, [errorId]);

  // Load autocomplete data
  useEffect(() => {
    const loadAutocompleteData = async () => {
      try {
        const errors = await errorService.getErrors();
        const brands = Array.from(new Set(errors.map(e => e.brand).filter(Boolean)));
        const models = Array.from(new Set(errors.map(e => e.model).filter(Boolean)));
        setAvailableBrands(brands);
        setAvailableModels(models);
      } catch (err) {
        console.error('Failed to load autocomplete data:', err);
      }
    };
    loadAutocompleteData();
  }, []);

  // Autosave effect
  useEffect(() => {
    if (!errorId || isLoading) return;

    const autoSave = async () => {
      try {
        setIsSaving(true);
        const cleanSteps = debouncedFormData.steps.filter(s => s.trim() !== '');

        await errorService.updateError(errorId, {
          ...debouncedFormData,
          steps: cleanSteps,
        });

        setLastSaved(new Date());
      } catch (err) {
        console.error('Autosave failed:', err);
      } finally {
        setIsSaving(false);
      }
    };

    autoSave();
  }, [debouncedFormData, errorId, isLoading]);

  const handleSave = async () => {
    if (!errorId) return;
    setIsSaving(true);
    try {
      // Filter out empty steps
      const cleanSteps = formData.steps.filter(s => s.trim() !== '');

      await errorService.updateError(errorId, {
        code: formData.code,
        brand: formData.brand,
        model: formData.model,
        title: formData.title,
        symptom: formData.symptom,
        cause: formData.cause,
        steps: cleanSteps,
        components: formData.components,
        tools: formData.tools,
        videos: formData.videos,
        status: formData.status,
        severity: formData.severity,
        isCommon: formData.isCommon,
      });

      if (onSave) onSave();
    } catch (err) {
      console.error('Failed to save error:', err);
      alert('Lỗi khi lưu! Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const addStep = () => {
    setFormData({ ...formData, steps: [...formData.steps, ''] });
  };

  const removeStep = (index: number) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const addTag = (field: 'components' | 'tools' | 'videos', value: string) => {
    if (!value.trim()) return;
    setFormData({ ...formData, [field]: [...formData[field], value.trim()] });
  };

  const removeTag = (field: 'components' | 'tools' | 'videos', index: number) => {
    const newArr = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArr });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="text-text-secondary">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!error && errorId) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-400">Không tìm thấy mã lỗi</div>
        <button onClick={onCancel} className="mt-4 text-primary hover:underline">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pb-32 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Sticky Header with Save Button */}
      <div className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur border-b border-border-dark/30 -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${formData.severity === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/20' :
                formData.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                  'bg-green-500/20 text-green-400 border-green-500/20'
                }`}>
                {formData.severity === 'high' ? 'Nghiêm trọng' : formData.severity === 'medium' ? 'Trung bình' : 'Thấp'}
              </span>
              <span className="text-text-secondary text-xs">ID: {errorId}</span>
            </div>
            <h1 className="text-xl font-bold text-white">
              {errorId ? `Chỉnh sửa: Mã lỗi ${formData.code}` : 'Thêm mã lỗi mới'}
            </h1>
            {lastSaved && (
              <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span>
                Đã lưu tự động lúc {lastSaved.toLocaleTimeString('vi-VN')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="text-xs text-text-secondary flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Đang lưu...
              </span>
            )}
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
            >
              Quay lại
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              Lưu ngay
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-border-dark/30 mb-8">
        {[
          { id: 'general', label: 'Thông tin chung' },
          { id: 'diagnosis', label: 'Chẩn đoán & Nguyên nhân' },
          { id: 'repair', label: 'Quy trình sửa chữa' },
          { id: 'components', label: 'Linh kiện & Công cụ' },
          { id: 'videos', label: 'Video hướng dẫn' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className={`cursor-pointer pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* General Info */}
          <section id="general" className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 shadow-xl shadow-black/20 scroll-mt-24">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Mã lỗi</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Hãng sản xuất</label>
                <input
                  type="text"
                  list="brand-suggestions"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Nhập hoặc chọn hãng..."
                />
                <datalist id="brand-suggestions">
                  {availableBrands.map((brand, i) => (
                    <option key={i} value={brand} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Model máy</label>
                <input
                  type="text"
                  list="model-suggestions"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Nhập hoặc chọn model..."
                />
                <datalist id="model-suggestions">
                  {availableModels.map((model, i) => (
                    <option key={i} value={model} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Mức độ</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Nghiêm trọng</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Tiêu đề lỗi</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isCommon"
                  checked={formData.isCommon}
                  onChange={(e) => setFormData({ ...formData, isCommon: e.target.checked })}
                  className="w-5 h-5 rounded bg-background-dark border-border-dark"
                />
                <label htmlFor="isCommon" className="text-sm text-white">Lỗi thường gặp (hiển thị trên trang chủ mobile)</label>
              </div>
            </div>
          </section>

          {/* Diagnosis & Cause */}
          <section id="diagnosis" className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 scroll-mt-24">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">monitor_heart</span>
              Chẩn đoán & Nguyên nhân
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Triệu chứng nhận biết</label>
                <textarea
                  rows={3}
                  value={formData.symptom}
                  onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Mô tả triệu chứng khi gặp lỗi này..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Nguyên nhân chi tiết</label>
                <textarea
                  rows={3}
                  value={formData.cause}
                  onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Nguyên nhân gây ra lỗi..."
                />
              </div>
            </div>
          </section>

          {/* Repair Steps */}
          <section id="repair" className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 scroll-mt-24">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">build</span>
              Quy trình sửa chữa
            </h2>
            <div className="space-y-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <span className="w-8 h-8 rounded-lg bg-background-dark flex items-center justify-center font-bold text-text-secondary border border-border-dark shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    className="flex-1 bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
                    placeholder={`Bước ${index + 1}...`}
                  />
                  {formData.steps.length > 1 && (
                    <button
                      onClick={() => removeStep(index)}
                      className="text-text-secondary hover:text-red-400 transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addStep}
                className="flex items-center gap-2 text-primary font-bold text-sm hover:underline pl-12"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Thêm bước thực hiện
              </button>
            </div>
          </section>

          {/* Components & Tools */}
          <section id="components" className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 scroll-mt-24">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">inventory_2</span>
              Linh kiện & Công cụ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Linh kiện liên quan</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.components.map((tag, i) => (
                    <span key={i} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                      {tag}
                      <button onClick={() => removeTag('components', i)} className="hover:text-white">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tên linh kiện..."
                    className="flex-1 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTag('components', (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Công cụ cần thiết</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tools.map((tag, i) => (
                    <span key={i} className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                      {tag}
                      <button onClick={() => removeTag('tools', i)} className="hover:text-white">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tên công cụ..."
                    className="flex-1 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTag('tools', (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Videos */}
          <section id="videos" className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 scroll-mt-24">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">play_circle</span>
              Video hướng dẫn (YouTube)
            </h2>
            <div className="space-y-4">
              {formData.videos.map((video, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <span className="material-symbols-outlined text-red-400">smart_display</span>
                  <input
                    type="text"
                    value={video}
                    onChange={(e) => {
                      const newVideos = [...formData.videos];
                      newVideos[i] = e.target.value;
                      setFormData({ ...formData, videos: newVideos });
                    }}
                    className="flex-1 bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white text-sm"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <button onClick={() => removeTag('videos', i)} className="text-text-secondary hover:text-red-400">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setFormData({ ...formData, videos: [...formData.videos, ''] })}
                className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Thêm video YouTube
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar - Remove Save button (now in header) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 sticky top-28">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Thông tin</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Trạng thái:</span>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="bg-background-dark border border-border-dark rounded-lg px-3 py-1 text-white text-sm"
                >
                  <option value="active">Đã duyệt</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border-dark/30">
                <p className="text-xs text-text-secondary">
                  💡 <strong>Mẹo:</strong> Thay đổi sẽ được lưu tự động sau 3 giây
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorEdit;
