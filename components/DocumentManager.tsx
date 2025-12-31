import React, { useState, useEffect } from 'react';
import { extractDriveFileId, getDrivePreviewLink, isValidDriveLink, getDriveImageLink } from '../utils/googleDriveUtils';
// import { MOCK_BRANDS } from '../constants'; // Removed
import { documentService, Document } from '../services/documentService';
import { brandService } from '../services/brandService';
import { Brand } from '../types';

const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]); // New State
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter State
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load documents and brands on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const [docs, allBrands] = await Promise.all([
          documentService.getDocuments(),
          brandService.getBrands()
        ]);
        setDocuments(docs);
        setBrands(allBrands);
    } catch (error) {
        console.error("Failed to load data", error);
    } finally {
        setLoading(false);
    }
  };

  // Filter Logic
  const filteredDocuments = documents.filter(doc => {
      const matchesBrand = selectedBrand === 'All' || doc.brand === selectedBrand;
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            doc.model_series?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBrand && matchesSearch;
  });
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    link: '',
    type: 'manual' as const
  });

  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleLinkChange = (link: string) => {
    setFormData({ ...formData, link });
    if (isValidDriveLink(link)) {
      const id = extractDriveFileId(link);
      setPreviewId(id);
    } else {
      setPreviewId(null);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !previewId) return alert("Vui lòng nhập Tiêu đề và Link hợp lệ");
    
    try {
      await documentService.addDocument({
        title: formData.title,
        brand: formData.brand || 'General',
        model_series: formData.model || 'All',
        fileId: previewId,
        previewUrl: getDrivePreviewLink(previewId),
        type: formData.type
      });
      
      // await loadDocuments(); // Refresh list - Reuse loadData or separate
      const docs = await documentService.getDocuments();
      setDocuments(docs);

      setIsModalOpen(false);
      setFormData({ title: '', brand: '', model: '', link: '', type: 'manual' });
      setPreviewId(null);
    } catch (error) {
       alert("Lỗi khi lưu tài liệu");
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Bạn có chắc muốn xóa tài liệu này?")) return;
    try {
        await documentService.deleteDocument(id);
        const docs = await documentService.getDocuments();
        setDocuments(docs);
    } catch (e) {
        alert("Xóa thất bại");
    }
  };

  return (
    <div className="h-full flex flex-col bg-background-dark p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kho Tài liệu</h1>
          <p className="text-text-secondary">Quản lý Service Manuals & Sơ đồ mạch (Google Drive Linked)</p>
        </div>
        
        <div className="flex gap-4">
             {/* Filter Controls */}
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm tài liệu..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-surface-dark border border-border-dark rounded-xl px-4 py-2 text-white text-sm focus:border-primary outline-none w-64"
                />
                <select 
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="bg-surface-dark border border-border-dark rounded-xl px-4 py-2 text-white text-sm focus:border-primary outline-none cursor-pointer"
                >
                    <option value="All">Tất cả hãng</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
            </div>

            <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all text-sm whitespace-nowrap"
            >
            <span className="material-symbols-outlined text-lg">add_link</span>
            Thêm Tài liệu
            </button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto custom-scroll pb-20">
        {filteredDocuments.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 opacity-50">
            <span className="material-symbols-outlined text-6xl mb-4">folder_off</span>
            <p>{searchQuery ? 'Không tìm thấy tài liệu phù hợp.' : 'Chưa có tài liệu nào. Bấm "Thêm Tài liệu" để bắt đầu.'}</p>
          </div>
        )}
        
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden hover:border-primary/50 transition-all group">
            {/* Thumbnail Preview Area */}
            <div className="aspect-[3/4] bg-black/40 relative group-hover:bg-black/20 transition-colors">
              {doc.type === 'image' ? (
                <img src={getDriveImageLink(doc.fileId)} className="w-full h-full object-cover" />
              ) : (
                <iframe 
                  src={doc.previewUrl} 
                  className="w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" 
                  title="Preview"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    doc.type === 'manual' ? 'bg-blue-500/20 text-blue-400' :
                    doc.type === 'schematic' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {doc.type}
                  </span>
                  <span className="text-[10px] text-gray-300 font-bold">{doc.brand}</span>
                </div>
                <h3 className="text-white font-bold leading-tight line-clamp-2">{doc.title}</h3>
              </div>
              
              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                <a 
                  href={doc.previewUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                  title="Xem trước"
                >
                  <span className="material-symbols-outlined">visibility</span>
                </a>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform" 
                  title="Xóa"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border-dark flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Thêm Tài liệu mới</h2>
              <button onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined text-gray-400 hover:text-white">close</span></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto custom-scroll">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Link chia sẻ Google Drive</label>
                <div className="flex gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="https://drive.google.com/file/d/..." 
                    value={formData.link}
                    onChange={(e) => handleLinkChange(e.target.value)}
                    className="flex-1 bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  />
                  <div className={`w-12 flex items-center justify-center rounded-xl border ${previewId ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-background-dark border-border-dark text-gray-600'}`}>
                    <span className="material-symbols-outlined">{previewId ? 'check_circle' : 'link_off'}</span>
                  </div>
                </div>
                {previewId && <p className="text-[10px] text-green-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">verified</span> Link hợp lệ ID: {previewId}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tiêu đề tài liệu</label>
                <input 
                  type="text" 
                  placeholder="VD: Hướng dẫn sửa chữa Daikin VRV IV" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Hãng</label>
                  <select 
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary outline-none appearance-none"
                  >
                    <option value="">-- Chọn Hãng --</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Loại tài liệu</label>
                   <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:border-primary outline-none appearance-none"
                  >
                    <option value="manual">Service Manual</option>
                    <option value="schematic">Sơ đồ mạch (Schematic)</option>
                    <option value="image">Hình ảnh thực tế</option>
                  </select>
                </div>
              </div>

              {/* Preview Box */}
              {previewId && (
                <div className="mt-4 rounded-xl overflow-hidden border border-border-dark bg-black/20 h-40 relative">
                   <iframe src={getDrivePreviewLink(previewId)} className="w-full h-full pointer-events-none opacity-50" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-xs text-white bg-black/50 px-3 py-1 rounded-full">Preview Thumbnail</p>
                   </div>
                </div>
              )}

            </div>

            <div className="p-6 border-t border-border-dark flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white">Hủy</button>
              <button 
                onClick={handleSave} 
                disabled={!previewId}
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${previewId ? 'bg-primary hover:bg-primary-hover shadow-primary/20' : 'bg-gray-700 cursor-not-allowed'}`}
              >
                Lưu vào Kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
