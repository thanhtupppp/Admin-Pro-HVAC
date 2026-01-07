import React, { useState, useEffect } from 'react';
import { documentService, Document } from '../services/documentService';
import { brandService } from '../services/brandService';
import { Brand } from '../types';

const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredDocuments = documents.filter(doc => {
    const matchesBrand = selectedBrand === 'All' || doc.brand === selectedBrand;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.model_series?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài liệu này?")) return;
    try {
      await documentService.deleteDocument(id);
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (e) {
      alert("Xóa thất bại");
    }
  };

  if (loading) {
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
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Kho Tài liệu</h1>
          <p className="text-sm text-text-muted">{documents.length} tài liệu kỹ thuật</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm tài liệu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
        />
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
        >
          <option value="All">Tất cả hãng</option>
          {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
        </select>
      </div>

      {/* Documents Table */}
      <div className="industrial-card">
        <table className="industrial-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Hãng</th>
              <th>Model Series</th>
              <th>Loại</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length > 0 ? filteredDocuments.map((doc) => (
              <tr key={doc.id}>
                <td className="font-medium text-text-primary">{doc.title}</td>
                <td className="text-text-secondary">{doc.brand}</td>
                <td className="text-text-muted text-sm">{doc.model_series || 'All'}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${doc.type === 'manual' ? 'bg-brand-primary/10 text-brand-primary' :
                      doc.type === 'schematic' ? 'bg-status-warn/10 text-status-warn' :
                        'bg-status-ok/10 text-status-ok'
                    }`}>
                    {doc.type}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={doc.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-text-secondary hover:text-brand-primary transition-colors"
                      title="Xem"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-text-secondary hover:text-status-error transition-colors"
                      title="Xóa"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-12 text-text-muted">
                  {searchQuery || selectedBrand !== 'All'
                    ? 'Không tìm thấy tài liệu phù hợp'
                    : 'Chưa có tài liệu nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentManager;
