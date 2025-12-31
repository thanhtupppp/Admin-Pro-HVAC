import React, { useState, useMemo, useRef, useEffect } from 'react';
import { errorService } from '../services/errorService';
import { ErrorCode } from '../types';
import BulkImportModal from './BulkImportModal';

interface ErrorListProps {
  onEdit: (id: string) => void;
}

const ROW_HEIGHT = 76;
const VISIBLE_ROWS = 12;

const ErrorList: React.FC<ErrorListProps> = ({ onEdit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ErrorCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    setIsLoading(true);
    try {
      const data = await errorService.getErrors();
      // Simulate large dataset if needed, or just use what we have. 
      // The original code generated 1000 items from mock.
      // If we want to keep the "Large Dataset" feel, we might need to replicate that logic 
      // or assume the service returns enough data.
      // For now, let's just use the service data directly. 
      // If the user wants 1000 items, the service should eventually provide pagination or 1000 items.
      setErrors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // The original component generated a large mocked dataset locally.
  // To keep the UI looking "full", I might want to replicate that generation or just stick to real data (which is small in mock).
  // Let's stick to real data from service to be "correct".
  // If the user complains about empty list, we will add more to mock service.

  const filteredData = useMemo(() => {
    return errors.filter(item =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [errors, searchTerm]);

  const selectedError = useMemo(() =>
    errors.find(e => e.id === selectedDetailId),
    [selectedDetailId, errors]
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2);
  const endIndex = Math.min(filteredData.length, startIndex + VISIBLE_ROWS + 5);
  const visibleData = filteredData.slice(startIndex, endIndex);
  const totalHeight = filteredData.length * ROW_HEIGHT;
  const offsetY = startIndex * ROW_HEIGHT;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa mã lỗi này?")) {
      await errorService.deleteError(id);
      setErrors(errors.filter(err => err.id !== id));
      if (selectedDetailId === id) setSelectedDetailId(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-text-secondary">Đang tải dữ liệu lỗi...</div>;
  }

  return (
    <div className="p-4 lg:p-8 h-full flex flex-col overflow-hidden relative">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Tìm trong danh sách mã lỗi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-dark border border-border-dark rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-text-secondary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner"
            />
          </div>
          <select className="bg-surface-dark border-border-dark rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:ring-1 focus:ring-primary outline-none cursor-pointer">
            <option>Tất cả hãng</option>
            <option>Panasonic</option>
            <option>Daikin</option>
            <option>Samsung</option>
          </select>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white/5 text-text-secondary font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            Import CSV
          </button>
          <button className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm mã lỗi mới
          </button>
        </div>
      </div>



      <BulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          loadErrors();
        }}
        type="errors"
      />

      {/* Virtualized Table Container */}
      <div className="flex-1 bg-surface-dark border border-border-dark/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
        <div className="bg-background-dark/80 backdrop-blur-md border-b border-border-dark/30 z-10">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="text-text-secondary uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4 w-[15%]">Mã lỗi</th>
                <th className="px-6 py-4 w-[20%]">Hãng sản xuất</th>
                <th className="px-6 py-4 w-[35%]">Tiêu đề nội dung</th>
                <th className="px-6 py-4 w-[15%]">Cập nhật</th>
                <th className="px-6 py-4 w-[15%] text-right">Hành động</th>
              </tr>
            </thead>
          </table>
        </div>

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scroll relative"
        >
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              <table className="w-full text-left text-sm table-fixed">
                <tbody className="divide-y divide-border-dark/10">
                  {visibleData.map((err) => (
                    <tr
                      key={err.id}
                      onClick={() => setSelectedDetailId(err.id)}
                      className={`group hover:bg-white/[0.04] transition-colors cursor-pointer ${selectedDetailId === err.id ? 'bg-primary/5' : ''}`}
                      style={{ height: `${ROW_HEIGHT}px` }}
                    >
                      <td className="px-6 py-2 w-[15%]">
                        <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center font-bold text-[11px] border shadow-sm ${err.severity === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                          {err.code}
                        </div>
                      </td>
                      <td className="px-6 py-2 w-[20%]">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{err.brand}</span>
                          <span className="text-[10px] text-text-secondary">Inverter Series</span>
                        </div>
                      </td>
                      <td className="px-6 py-2 w-[35%]">
                        <div className="truncate text-gray-300 font-medium pr-4" title={err.title}>
                          {err.title}
                        </div>
                        <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20">
                          {err.status}
                        </span>
                      </td>
                      <td className="px-6 py-2 w-[15%] text-text-secondary text-[11px] font-mono">
                        {err.updatedAt}
                      </td>
                      <td className="px-6 py-2 w-[15%] text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(err.id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-text-secondary hover:text-primary transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(err.id, e)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-500 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-background-dark/30 border-t border-border-dark/30 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
            Hiển thị <span className="text-white">{filteredData.length.toLocaleString()}</span> mã lỗi hệ thống
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] text-text-secondary font-bold uppercase">Database Online</span>
          </div>
        </div>
      </div>

      {/* Side Detail Panel */}
      {
        selectedError && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => setSelectedDetailId(null)}
            />
            <div className="fixed top-0 right-0 h-screen w-full max-w-md bg-surface-dark border-l border-border-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out translate-x-0">
              <div className="h-full flex flex-col">
                {/* Panel Header */}
                <div className="p-6 border-b border-border-dark/30 flex items-center justify-between bg-background-dark/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <span className="font-bold text-lg">{selectedError.code}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight">{selectedError.brand}</h3>
                      <p className="text-xs text-text-secondary uppercase tracking-widest">Thông tin chi tiết mã lỗi</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDetailId(null)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-8">
                  {/* Title Section */}
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Tên lỗi</h4>
                    <p className="text-white font-medium leading-relaxed">{selectedError.title}</p>
                  </div>

                  {/* Symptom Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">monitor_heart</span>
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Triệu chứng nhận biết</h4>
                    </div>
                    <div className="bg-background-dark/50 rounded-xl p-4 border border-border-dark/30">
                      <p className="text-sm text-gray-300 leading-relaxed italic">"{selectedError.symptom}"</p>
                    </div>
                  </div>

                  {/* Cause Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 text-[20px]">report_problem</span>
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Nguyên nhân dự kiến</h4>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed px-1">
                      {selectedError.cause}
                    </p>
                  </div>

                  {/* Components Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500 text-[20px]">inventory_2</span>
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Linh kiện liên quan</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedError.components?.map((comp, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white/5 border border-border-dark rounded-lg text-xs text-white font-medium">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tools Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-500 text-[20px]">handyman</span>
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Công cụ cần thiết</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedError.tools?.map((tool, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white/5 border border-border-dark rounded-lg text-xs text-white font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Steps Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-500 text-[20px]">checklist</span>
                      <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Các bước kiểm tra</h4>
                    </div>
                    <div className="space-y-3">
                      {selectedError.steps?.map((step, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-background-dark/30 rounded-xl border border-border-dark/20">
                          <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-gray-400 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image Gallery */}
                  {selectedError.images && selectedError.images.length > 0 && (
                    <div className="pt-2 border-t border-border-dark/30">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-purple-500 text-[20px]">image</span>
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Hình ảnh minh họa</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedError.images.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setZoomedImageIndex(idx)}
                            className="relative group aspect-square rounded-xl bg-black/40 border border-border-dark/30 overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
                          >
                            {img.startsWith('http') && !img.includes('base64') ? (
                              <img
                                src={img}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              // Base64 Image
                              <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="material-symbols-outlined text-white">zoom_in</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Player */}
                  {/* Video Player (Multiple) */}
                  {(selectedError.videos && selectedError.videos.length > 0) && (
                    <div className="pt-6 border-t border-border-dark/30">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-red-500 text-[20px]">smart_display</span>
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Video Hướng dẫn ({selectedError.videos.length})</h4>
                      </div>
                      <div className="space-y-6">
                        {selectedError.videos.map((videoUrl, idx) => (
                          <div key={idx} className="bg-black/20 rounded-xl p-4 border border-border-dark/30">
                            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg mb-2">
                              {(() => {
                                const getYouTubeId = (url: string) => {
                                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                  const match = url?.match(regExp);
                                  return (match && match[2].length === 11) ? match[2] : null;
                                };
                                const videoId = getYouTubeId(videoUrl);
                                return videoId ? (
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    className="w-full h-full"
                                    title={`Video Hướng dẫn ${idx + 1}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                    Link video không hợp lệ
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">
                                {idx + 1}
                              </span>
                              <span className="text-xs text-gray-400 truncate flex-1">{videoUrl}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>



                {/* Panel Footer */}
                <div className="p-6 border-t border-border-dark/30 bg-background-dark/30">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => onEdit(selectedError.id)}
                      className="flex items-center justify-center gap-2 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Chỉnh sửa ngay
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-border-dark transition-all">
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Chia sẻ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      }

      {/* Lightbox / Zoom Modal */}
      {/* Lightbox / Zoom Modal */}
      {zoomedImageIndex !== null && selectedError?.images && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomedImageIndex(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50"
            onClick={() => setZoomedImageIndex(null)}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {/* Previous Button */}
          {zoomedImageIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-primary/80 text-white rounded-full transition-all z-10"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedImageIndex(zoomedImageIndex - 1);
              }}
            >
              <span className="material-symbols-outlined text-3xl">chevron_left</span>
            </button>
          )}

          {/* Main Image */}
          <img
            src={selectedError.images[zoomedImageIndex]}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl scale-in-95 animate-in duration-200"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Button */}
          {zoomedImageIndex < selectedError.images.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-primary/80 text-white rounded-full transition-all z-10"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedImageIndex(zoomedImageIndex + 1);
              }}
            >
              <span className="material-symbols-outlined text-3xl">chevron_right</span>
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm font-medium backdrop-blur-md">
            {zoomedImageIndex + 1} / {selectedError.images.length}
          </div>
        </div>
      )}
    </div >
  );
};

export default ErrorList;
