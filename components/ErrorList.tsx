import React, { useState, useEffect } from 'react';
import { errorService } from '../services/errorService';
import { ErrorCode } from '../types';
import AlertBox from './AlertBox';

interface ErrorListProps {
  onEdit: (id: string) => void;
}

const ErrorList: React.FC<ErrorListProps> = ({ onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [errors, setErrors] = useState<ErrorCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewError, setPreviewError] = useState<ErrorCode | null>(null);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    setIsLoading(true);
    try {
      const data = await errorService.getErrors();
      setErrors(data);
    } catch (e) {
      console.error('Failed to load errors', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredErrors = errors.filter(err => {
    const matchSearch = searchTerm === '' ||
      err.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchBrand = selectedBrand === 'all' || err.brand === selectedBrand;

    return matchSearch && matchBrand;
  });

  const uniqueBrands = Array.from(new Set(errors.map(e => e.brand)));

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa mã lỗi này?')) {
      try {
        await errorService.deleteError(id);
        setErrors(errors.filter(e => e.id !== id));
      } catch (e) {
        console.error('Failed to delete error', e);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-pulse-slow text-brand-primary text-4xl mb-4">●</div>
          <p className="text-text-secondary text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header - Corporate Clean */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Quản lý mã lỗi</h1>
          <p className="text-sm text-text-muted">Danh sách {errors.length} mã lỗi trong hệ thống</p>
        </div>
        <button
          onClick={() => onEdit('new')}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-accent text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Thêm mã lỗi
        </button>
      </div>

      {/* Filters - Simple & Clean */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm mã lỗi, tiêu đề, hãng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
          />
        </div>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
        >
          <option value="all">Tất cả hãng</option>
          {uniqueBrands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      {searchTerm || selectedBrand !== 'all' ? (
        <div className="text-sm text-text-muted">
          Tìm thấy <span className="text-text-primary font-mono">{filteredErrors.length}</span> kết quả
        </div>
      ) : null}

      {/* Industrial Table */}
      <div className="industrial-card overflow-hidden">
        <table className="industrial-table">
          <thead>
            <tr>
              <th>Mã lỗi</th>
              <th>Tiêu đề</th>
              <th>Hãng</th>
              <th>Model</th>
              <th>Lượt xem</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredErrors.map((error) => (
              <tr key={error.id}>
                <td className="font-mono text-brand-primary font-medium">{error.code}</td>
                <td className="text-text-primary">{error.title}</td>
                <td className="text-text-secondary">{error.brand}</td>
                <td className="text-text-secondary text-sm">{error.modelName || '—'}</td>
                <td className="font-mono text-text-muted text-sm">{error.views || 0}</td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setPreviewError(error)}
                      className="text-text-secondary hover:text-blue-400 transition-colors"
                      title="Xem nhanh"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    <button
                      onClick={() => onEdit(error.id)}
                      className="text-text-secondary hover:text-brand-primary transition-colors"
                      title="Chỉnh sửa"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(error.id)}
                      className="text-text-secondary hover:text-status-error transition-colors"
                      title="Xóa"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredErrors.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            {searchTerm || selectedBrand !== 'all'
              ? 'Không tìm thấy kết quả phù hợp'
              : 'Chưa có mã lỗi nào trong hệ thống'}
          </div>
        )}
      </div>

      {/* Info Alert */}
      {errors.length > 50 && (
        <AlertBox
          type="info"
          title="Hiệu suất cao"
          message={`Hệ thống đang quản lý ${errors.length} mã lỗi. Sử dụng bộ lọc để tìm kiếm nhanh hơn.`}
        />
      )}

      {/* Preview Drawer */}
      {previewError && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setPreviewError(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div
            className="relative w-full max-w-2xl bg-background-dark border-l border-border-dark shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-background-dark/95 backdrop-blur-sm border-b border-border-dark p-6 flex items-start justify-between z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-mono font-bold text-brand-primary">{previewError.code}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${previewError.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {previewError.status === 'active' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{previewError.title}</h2>
                <p className="text-sm text-text-secondary mt-1">{previewError.brand} {previewError.modelName && `• ${previewError.modelName}`}</p>
              </div>
              <button
                onClick={() => setPreviewError(null)}
                className="text-text-secondary hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6">
              {/* Diagnosis */}
              {previewError.diagnosis && (
                <div className="bg-bg-soft rounded-xl p-4 border border-border-base">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500">search</span>
                    Chẩn đoán
                  </h3>
                  <p className="text-sm text-text-secondary">{previewError.diagnosis}</p>
                </div>
              )}

              {/* Repair Steps */}
              {previewError.steps && previewError.steps.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500">build</span>
                    Các bước sửa chữa
                  </h3>
                  <div className="space-y-2">
                    {previewError.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 bg-bg-soft rounded-lg p-3 border border-border-base">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-text-secondary">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Components & Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previewError.components && previewError.components.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase mb-2">Linh kiện liên quan</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewError.components.map((comp, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {previewError.tools && previewError.tools.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase mb-2">Công cụ cần thiết</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewError.tools.map((tool, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border-dark">
                <button
                  onClick={() => {
                    setPreviewError(null);
                    onEdit(previewError.id);
                  }}
                  className="flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-accent text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setPreviewError(null)}
                  className="px-4 py-2 bg-bg-soft hover:bg-white/5 text-text-secondary hover:text-white font-medium rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorList;
