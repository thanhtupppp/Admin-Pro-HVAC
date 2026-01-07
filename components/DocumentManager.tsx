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

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    title: '',
    brand: '',
    model_series: '',
    type: 'manual' as 'manual' | 'schematic' | 'image'
  });
  const [isUploading, setIsUploading] = useState(false);

  // Preview modal states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDocument, setEditDocument] = useState<Document | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Auto-fill title from filename
      setUploadMetadata(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, "") // Remove extension
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadFile(file);
      setUploadMetadata(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, "")
      }));
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      alert("Vui lòng chọn file!");
      return;
    }
    if (!uploadMetadata.title || !uploadMetadata.brand) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setIsUploading(true);
    try {
      await documentService.uploadDocument(uploadFile, uploadMetadata);
      alert("✅ Upload thành công!");
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadMetadata({ title: '', brand: '', model_series: '', type: 'manual' });
      await loadData();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("❌ Upload thất bại!");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
    setShowPreviewModal(true);
  };

  // Helper function to convert Google Drive link to embeddable preview URL
  const getGoogleDrivePreviewUrl = (url: string): string | null => {
    if (!url) return null;
    
    // Check if it's a Google Drive link
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    // Check if it's already a preview link
    if (url.includes('drive.google.com') && url.includes('/preview')) {
      return url;
    }
    
    // Not a Google Drive link, return as is
    return url;
  };

  const handleEdit = (doc: Document) => {
    setEditDocument(doc);
    setShowEditModal(true);
  };

  const handleUpdateDocument = async () => {
    if (!editDocument) return;

    try {
      await documentService.updateDocument(editDocument.id, {
        title: editDocument.title,
        brand: editDocument.brand,
        model_series: editDocument.model_series,
        type: editDocument.type
      });
      alert("✅ Cập nhật thành công!");
      setShowEditModal(false);
      setEditDocument(null);
      await loadData();
    } catch (error) {
      alert("❌ Cập nhật thất bại!");
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
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-lg transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">upload</span>
          Upload Tài liệu
        </button>
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
                    <button
                      onClick={() => handlePreview(doc)}
                      className="text-text-secondary hover:text-brand-primary transition-colors"
                      title="Xem"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    <button
                      onClick={() => handleEdit(doc)}
                      className="text-text-secondary hover:text-blue-500 transition-colors"
                      title="Sửa"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">Upload Tài liệu Mới</h3>

            {/* File Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border-dark rounded-xl p-8 text-center hover:border-brand-primary/50 transition-all mb-6"
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-5xl text-text-secondary">
                  {uploadFile ? 'check_circle' : 'upload_file'}
                </span>
                <p className="text-sm text-white font-medium">
                  {uploadFile ? uploadFile.name : 'Click để chọn file hoặc kéo thả vào đây'}
                </p>
                <p className="text-xs text-text-secondary">PDF, JPG, PNG (Max 10MB)</p>
              </label>
            </div>

            {/* Metadata Form */}
            {uploadFile && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={uploadMetadata.title}
                    onChange={(e) => setUploadMetadata(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Hãng</label>
                    <select
                      value={uploadMetadata.brand}
                      onChange={(e) => setUploadMetadata(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                    >
                      <option value="">Chọn hãng</option>
                      {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Loại</label>
                    <select
                      value={uploadMetadata.type}
                      onChange={(e) => setUploadMetadata(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                    >
                      <option value="manual">Manual</option>
                      <option value="schematic">Schematic</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Model Series (Tùy chọn)</label>
                  <input
                    type="text"
                    value={uploadMetadata.model_series}
                    onChange={(e) => setUploadMetadata(prev => ({ ...prev, model_series: e.target.value }))}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                    placeholder="Ví dụ: CU-XPU9XKH-8"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadMetadata({ title: '', brand: '', model_series: '', type: 'manual' });
                }}
                disabled={isUploading}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || !uploadFile}
                className="flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
              >
                {isUploading ? 'Đang upload...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewDocument && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-dark">
              <div>
                <h3 className="text-xl font-bold text-white">{previewDocument.title}</h3>
                <p className="text-sm text-text-secondary mt-1">
                  {previewDocument.brand} {previewDocument.model_series && `• ${previewDocument.model_series}`} • {previewDocument.type}
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-text-secondary hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-6">
              {previewDocument.previewUrl ? (
                <>
                  {/* Google Drive Preview */}
                  {previewDocument.previewUrl.includes('drive.google.com') ? (
                    <div className="w-full h-[600px] bg-background-dark rounded-lg overflow-hidden">
                      <iframe
                        src={getGoogleDrivePreviewUrl(previewDocument.previewUrl) || previewDocument.previewUrl}
                        className="w-full h-full border-0"
                        title={previewDocument.title}
                        allow="autoplay"
                      />
                    </div>
                  ) : (
                    <>
                      {/* Local PDF Preview */}
                      {previewDocument.previewUrl.startsWith('data:application/pdf') ? (
                        <div className="w-full h-[600px] bg-background-dark rounded-lg overflow-hidden">
                          <iframe
                            src={previewDocument.previewUrl}
                            className="w-full h-full border-0"
                            title={previewDocument.title}
                          />
                        </div>
                      ) : (
                        /* Image Preview */
                        <div className="flex items-center justify-center bg-background-dark rounded-lg p-4">
                          <img
                            src={previewDocument.previewUrl}
                            alt={previewDocument.title}
                            className="max-w-full max-h-[600px] h-auto object-contain"
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-text-secondary">
                  <span className="material-symbols-outlined text-6xl mb-4">description</span>
                  <p className="text-lg">Không có preview cho tài liệu này</p>
                  <p className="text-sm mt-2">Vui lòng tải xuống để xem nội dung đầy đủ</p>
                </div>
              )}
            </div>

            {/* Footer with metadata and actions */}
            <div className="p-6 border-t border-border-dark">
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-text-secondary">Hãng</p>
                  <p className="text-white font-medium">{previewDocument.brand}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Model</p>
                  <p className="text-white font-medium">{previewDocument.model_series || 'All'}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Loại</p>
                  <p className="text-white font-medium capitalize">{previewDocument.type}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {previewDocument.previewUrl && (
                  <>
                    {/* Open in new tab for Google Drive */}
                    {previewDocument.previewUrl.includes('drive.google.com') ? (
                      <a
                        href={previewDocument.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                        Mở trong Google Drive
                      </a>
                    ) : (
                      /* Download button for local files */
                      <a
                        href={previewDocument.previewUrl}
                        download={`${previewDocument.title}.${previewDocument.previewUrl.includes('pdf') ? 'pdf' : 'jpg'}`}
                        className="flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Tải xuống
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-white mb-6">Chỉnh sửa Tài liệu</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={editDocument.title}
                  onChange={(e) => setEditDocument({ ...editDocument, title: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Hãng</label>
                  <select
                    value={editDocument.brand}
                    onChange={(e) => setEditDocument({ ...editDocument, brand: e.target.value })}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                  >
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Loại</label>
                  <select
                    value={editDocument.type}
                    onChange={(e) => setEditDocument({ ...editDocument, type: e.target.value as any })}
                    className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                  >
                    <option value="manual">Manual</option>
                    <option value="schematic">Schematic</option>
                    <option value="image">Image</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Model Series</label>
                <input
                  type="text"
                  value={editDocument.model_series}
                  onChange={(e) => setEditDocument({ ...editDocument, model_series: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditDocument(null);
                }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateDocument}
                className="flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-lg transition-all"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
