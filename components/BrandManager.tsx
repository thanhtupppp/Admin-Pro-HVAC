
import React, { useState, useMemo } from 'react';
import { MOCK_BRANDS, MOCK_MODELS } from '../constants';

const BrandManager: React.FC = () => {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredBrands = useMemo(() => 
    MOCK_BRANDS.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const selectedBrand = useMemo(() => 
    MOCK_BRANDS.find(b => b.id === selectedBrandId),
    [selectedBrandId]
  );

  const brandModels = useMemo(() => 
    MOCK_MODELS.filter(m => m.brandId === selectedBrandId),
    [selectedBrandId]
  );

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Hãng & Model</h1>
          <p className="text-text-secondary text-sm">Quản lý danh mục thiết bị hỗ trợ trên hệ thống</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setShowAddModal(true)}
             className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
           >
            <span className="material-symbols-outlined text-[20px]">add_business</span>
            Thêm Hãng mới
          </button>
        </div>
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
                    style={{ backgroundColor: brand.color }}
                  >
                    {brand.logo}
                  </div>
                  <button className="p-2 text-text-secondary hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
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
                style={{ backgroundColor: selectedBrand?.color }}
              >
                {selectedBrand?.logo}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedBrand?.name}</h2>
                <p className="text-xs text-text-secondary uppercase tracking-widest">Danh sách dòng máy và thiết bị</p>
              </div>
              <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all">
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
                           <button className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
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

      {/* Simplified Add Modal Backdrop */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-surface-dark border border-border-dark rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-border-dark/30 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Thêm Thương Hiệu</h3>
                <button onClick={() => setShowAddModal(false)} className="text-text-secondary hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Tên thương hiệu</label>
                  <input type="text" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="Ví dụ: Daikin" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Mã viết tắt</label>
                    <input type="text" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="DK" maxLength={2} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Màu đại diện</label>
                    <input type="color" className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-2 py-1 cursor-pointer" defaultValue="#136dec" />
                  </div>
                </div>
             </div>
             <div className="p-6 border-t border-border-dark/30">
                <button className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
                  Tạo thương hiệu
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandManager;
