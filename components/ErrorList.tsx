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
    </div>
  );
};

export default ErrorList;
