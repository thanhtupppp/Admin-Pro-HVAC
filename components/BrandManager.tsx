import React, { useState, useMemo, useEffect } from 'react';
import { brandService } from '../services/brandService';
import { Brand, Model } from '../types';

const BrandManager: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [showAddModelModal, setShowAddModelModal] = useState(false);

  const convertGoogleDriveLink = (url: string) => {
    try {
      if (!url.includes('drive.google.com')) return url;
      // Extract ID
      let id = '';
      const parts = url.split('/');
      // Case 1: .../d/ID/view
      const dIndex = parts.indexOf('d');
      if (dIndex !== -1 && parts.length > dIndex + 1) {
        id = parts[dIndex + 1];
      }
      // Case 2: id=ID
      if (!id && url.includes('id=')) {
        id = url.split('id=')[1].split('&')[0];
      }

      if (id) {
        return `https://lh3.googleusercontent.com/d/${id}`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  // New Brand Form State
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandShortName, setNewBrandShortName] = useState('');
  const [newBrandColor, setNewBrandColor] = useState('#136dec');

  // New Model Form State
  const [newModelName, setNewModelName] = useState('');
  const [newModelType, setNewModelType] = useState('Máy lạnh');
  const [newModelNotes, setNewModelNotes] = useState('');

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

  // We no longer filter from global `models`, we use `models` which IS the brand's models now
  const brandModels = models;

  const handleCreateBrand = async () => {
    if (!newBrandName) return;

    const brandData = {
        name: newBrandName,
        logo: newBrandShortName.startsWith('http') 
              ? (convertGoogleDriveLink(newBrandShortName) || newBrandShortName)
              : (newBrandShortName || newBrandName.substring(0, 1).toUpperCase()),
        color: newBrandColor
    };

    try {
      if (editingBrand) {
        // UPDATE Existing Brand
        await brandService.updateBrand(editingBrand.id, brandData);
        setBrands(brands.map(b => b.id === editingBrand.id ? { ...b, ...brandData } : b));
      } else {
        // CREATE New Brand
        const newBrand = await brandService.createBrand(brandData as any);
        setBrands([newBrand, ...brands]);
      }
      
      setShowAddBrandModal(false);
      resetBrandForm();
    } catch (e) {
      alert(editingBrand ? "Failed to update brand" : "Failed to create brand");
    }
  };

  const handleEditBrand = (brand: Brand, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBrand(brand);
    setNewBrandName(brand.name);
    setNewBrandShortName(brand.logo); 
    setNewBrandColor((brand as any).color || '#136dec');
    setShowAddBrandModal(true);
  };

  const handleCreateModel = async () => {
    if (!newModelName || !selectedBrandId) return;
    try {
      const newModel = await brandService.createModel({
        brandId: selectedBrandId,
        name: newModelName,
        type: newModelType,
        notes: newModelNotes,
      });
      setModels([...models, newModel]);

      // Update brand count locally to reflect change immediately
      setBrands(brands.map(b =>
        b.id === selectedBrandId
          ? { ...b, modelCount: b.modelCount + 1 }
          : b
      ));

      setShowAddModelModal(false);
      resetModelForm();
    } catch (e) {
      alert("Failed to create model");
    }
  };

  const handleDeleteBrand = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      // Update count
      if (selectedBrandId) {
        setBrands(brands.map(b =>
          b.id === selectedBrandId
            ? { ...b, modelCount: Math.max(0, b.modelCount - 1) }
            : b
        ));
      }
    }
  };

  const resetBrandForm = () => {
    setEditingBrand(null);
    setNewBrandName('');
    setNewBrandShortName('');
    setNewBrandColor('#136dec');
  };

  const resetModelForm = () => {
    setNewModelName('');
    setNewModelType('Máy lạnh');
    setNewModelNotes('');
  };

  if (isLoading && brands.length === 0) {
    return <div className="p-8 text-center text-text-secondary">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Hãng & Model</h1>
          <p className="text-text-secondary text-sm">Quản lý danh mục thiết bị hỗ trợ trên hệ thống</p>
        </div>
        {!selectedBrandId && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingBrand(null); 
                setShowAddBrandModal(true);
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add_business</span>
              Thêm Hãng mới
            </button>
          </div>
        )}
      </div>

      {!selectedBrandId ? (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary">search</span>
            <input
              type="text"
              placeholder="Tìm tên thương hiệu..."
              className="w-full bg-surface-dark border border-border-dark rounded-xl pl-12 pr-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => setSelectedBrandId(brand.id)}
                className="group relative bg-surface-dark border border-border-dark/50 rounded-3xl p-6 cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-inner border border-white/5"
                    style={{ backgroundColor: (brand as any).color || '#3b82f6' }}
                  >
                    {brand.logo.startsWith('http') ? (
                       <img 
                          src={convertGoogleDriveLink(brand.logo) || brand.logo} 
                          alt={brand.name} 
                          className="w-full h-full object-contain p-2"
                       />
                    ) : (
                       brand.logo
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => handleEditBrand(brand, e)} className="p-2 text-text-secondary hover:text-primary transition-colors bg-black/20 rounded-lg hover:bg-black/40">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={(e) => handleDeleteBrand(brand.id, e)} className="p-2 text-text-secondary hover:text-red-500 transition-colors bg-black/20 rounded-lg hover:bg-black/40">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{brand.name}</h3>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-sm">inventory_2</span>
                  <span className="text-xs font-medium uppercase tracking-widest">{brand.modelCount} Models</span>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-surface-dark bg-border-dark flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px] text-text-secondary">ac_unit</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    CHI TIẾT <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedBrandId(null)}
              className="w-10 h-10 rounded-xl bg-surface-dark border border-border-dark flex items-center justify-center text-text-secondary hover:text-white transition-all"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              style={{ backgroundColor: (selectedBrand as any)?.color || '#3b82f6' }}
            >
               {selectedBrand?.logo.startsWith('http') ? (
                   <img 
                      src={convertGoogleDriveLink(selectedBrand.logo) || selectedBrand.logo} 
                      alt={selectedBrand.name} 
                      className="w-full h-full object-contain p-1"
                   />
               ) : (
                  selectedBrand?.logo
               )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedBrand?.name}</h2>
              <p className="text-xs text-text-secondary uppercase tracking-widest">Danh sách dòng máy và thiết bị</p>
            </div>
            <button
              onClick={() => setShowAddModelModal(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Thêm Model mới
            </button>
          </div>

          <div className="bg-surface-dark border border-border-dark/50 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-dark/50 text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-border-dark/30">
                  <th className="px-8 py-5">Tên Model</th>
                  <th className="px-8 py-5">Loại thiết bị</th>
                  <th className="px-8 py-5">Ghi chú kỹ thuật</th>
                  <th className="px-8 py-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/20">
                {brandModels.length > 0 ? brandModels.map((model) => (
                  <tr key={model.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-white">{model.name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {model.type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-text-secondary">{model.notes}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteModel(model.id)}
                          className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <span className="material-symbols-outlined text-6xl">inventory_2</span>
                        <p className="mt-4 font-bold uppercase tracking-widest text-xs">Chưa có Model nào cho hãng này</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {showAddBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setShowAddBrandModal(false)}></div>
          <div className="relative bg-surface-dark border border-border-dark rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border-dark/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{editingBrand ? 'Cập nhật Thương hiệu' : 'Thêm Thương Hiệu'}</h3>
              <button onClick={() => setShowAddBrandModal(false)} className="text-text-secondary hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Tên thương hiệu</label>
                <input
                  type="text"
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Ví dụ: Daikin"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Logo (URL hoặc Mã)</label>
                  <input
                    type="text"
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Link ảnh hoặc DK"
                    value={newBrandShortName}
                    onChange={(e) => setNewBrandShortName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Màu đại diện</label>
                  <input
                    type="color"
                    className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-2 py-1 cursor-pointer"
                    value={newBrandColor}
                    onChange={(e) => setNewBrandColor(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Logo Preview */}
              {newBrandShortName && (
                 <div className="flex flex-col items-center gap-2 p-4 bg-background-dark rounded-xl border border-border-dark border-dashed">
                    <span className="text-[10px] text-text-secondary uppercase font-bold">Preview Logo</span>
                    {newBrandShortName.startsWith('http') ? (
                       <img 
                         src={convertGoogleDriveLink(newBrandShortName) || newBrandShortName} 
                         alt="Logo Preview" 
                         className="h-16 w-16 object-contain rounded-lg bg-white/5"
                         onError={(e) => (e.currentTarget.style.display = 'none')} 
                       />
                    ) : (
                       <div 
                         className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-inner border border-white/5"
                         style={{ backgroundColor: newBrandColor }}
                       >
                         {newBrandShortName}
                       </div>
                    )}
                 </div>
              )}

            </div>
            <div className="p-6 border-t border-border-dark/30">
              <button
                onClick={handleCreateBrand}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
              >
                {editingBrand ? 'Lưu thay đổi' : 'Tạo thương hiệu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Model Modal */}
      {showAddModelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setShowAddModelModal(false)}></div>
          <div className="relative bg-surface-dark border border-border-dark rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border-dark/30 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Thêm Model Mới</h3>
              <button onClick={() => setShowAddModelModal(false)} className="text-text-secondary hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Tên Model</label>
                <input
                  type="text"
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Ví dụ: FTKF25XVMV"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Loại thiết bị</label>
                <select
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none"
                  value={newModelType}
                  onChange={(e) => setNewModelType(e.target.value)}
                >
                  <option value="Máy lạnh">Máy lạnh</option>
                  <option value="Tủ lạnh">Tủ lạnh</option>
                  <option value="Máy giặt">Máy giặt</option>
                  <option value="Máy nước nóng">Máy nước nóng</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Ghi chú (Tùy chọn)</label>
                <textarea
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none resize-none h-24"
                  placeholder="Ví dụ: Inverter, Gas R32..."
                  value={newModelNotes}
                  onChange={(e) => setNewModelNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-border-dark/30">
              <button
                onClick={handleCreateModel}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
              >
                Thêm Model
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandManager;
