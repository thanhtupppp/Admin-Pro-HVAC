import React, { useState, useMemo, useEffect } from 'react';
import { brandService } from '../services/brandService';
import { Brand, Model } from '../types';

const BrandManager: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    type: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allBrands = await brandService.getBrands();
      setBrands(allBrands);
    } catch (error) {
      console.error("Failed to load brands", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBrandId) {
      brandService.getModelsByBrand(selectedBrandId).then(setModels);
    } else {
      setModels([]);
    }
  }, [selectedBrandId]);

  const filteredBrands = useMemo(() =>
    brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [brands, searchTerm]
  );

  const selectedBrand = useMemo(() =>
    brands.find(b => b.id === selectedBrandId),
    [brands, selectedBrandId]
  );

  const handleDeleteBrand = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa thương hiệu này?')) {
      await brandService.deleteBrand(id);
      setBrands(brands.filter(b => b.id !== id));
      if (selectedBrandId === id) setSelectedBrandId(null);
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa model này?')) {
      await brandService.deleteModel(id);
      setModels(models.filter(m => m.id !== id));
    }
  };

  const handleAddModel = async () => {
    if (!selectedBrandId || !newModel.name.trim()) {
      alert('Vui lòng nhập tên model!');
      return;
    }

    try {
      await brandService.createModel({
        brandId: selectedBrandId,
        name: newModel.name,
        type: newModel.type || 'HVAC',
        notes: newModel.notes
      });
      // Reload models
      const updatedModels = await brandService.getModelsByBrand(selectedBrandId);
      setModels(updatedModels);
      // Reset form
      setNewModel({ name: '', type: '', notes: '' });
      setShowAddModel(false);
    } catch (error) {
      console.error('Failed to add model:', error);
      alert('Lỗi khi thêm model!');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Hãng & Model</h1>
          <p className="text-sm text-text-muted">Quản lý {brands.length} thương hiệu thiết bị</p>
        </div>
      </div>

      {!selectedBrandId ? (
        <div className="space-y-6">
          {/* Search */}
          <input
            type="text"
            placeholder="Tìm thương hiệu..."
            className="w-full max-w-md bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Brand Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => setSelectedBrandId(brand.id)}
                className="industrial-card cursor-pointer hover:border-brand-primary/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-text-primary">{brand.name}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteBrand(brand.id); }}
                    className="text-text-secondary hover:text-status-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
                <div className="text-sm text-text-secondary">
                  <span className="font-mono">{brand.modelCount}</span> models
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Back Button and Add Model Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedBrandId(null)}
                className="text-text-secondary hover:text-brand-primary transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="text-xl font-semibold text-text-primary">{selectedBrand?.name}</h2>
            </div>
            <button
              onClick={() => setShowAddModel(true)}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Thêm Model
            </button>
          </div>

          {/* Add Model Form */}
          {showAddModel && (
            <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Thêm Model Mới</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Tên Model</label>
                  <input
                    type="text"
                    value={newModel.name}
                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                    placeholder="VD: CU-XPU9XKH-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Loại thiết bị</label>
                  <input
                    type="text"
                    value={newModel.type}
                    onChange={(e) => setNewModel({ ...newModel, type: e.target.value })}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                    placeholder="VD: Điều hòa"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Ghi chú</label>
                  <input
                    type="text"
                    value={newModel.notes}
                    onChange={(e) => setNewModel({ ...newModel, notes: e.target.value })}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                    placeholder="Ghi chú (tùy chọn)"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowAddModel(false);
                    setNewModel({ name: '', type: '', notes: '' });
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddModel}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-lg transition-all"
                >
                  Lưu Model
                </button>
              </div>
            </div>
          )}

          {/* Models Table */}
          <div className="industrial-card">
            <table className="industrial-table">
              <thead>
                <tr>
                  <th>Tên Model</th>
                  <th>Loại thiết bị</th>
                  <th>Ghi chú</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {models.length > 0 ? models.map((model) => (
                  <tr key={model.id}>
                    <td className="font-medium text-text-primary">{model.name}</td>
                    <td className="text-text-secondary text-sm">{model.type}</td>
                    <td className="text-text-muted text-sm">{model.notes || '—'}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDeleteModel(model.id)}
                        className="text-text-secondary hover:text-status-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-text-muted">
                      Chưa có model nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandManager;
