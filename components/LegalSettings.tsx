import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const LegalSettings: React.FC = () => {
  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchLegalContent();
  }, []);

  const fetchLegalContent = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'configurations', 'legal');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTerms(data.termsOfService || '');
        setPrivacy(data.privacyPolicy || '');
        if (data.updatedAt) {
          setLastUpdated(data.updatedAt.toDate());
        }
      } else {
        // Initialize with default template if empty
        setTerms('## Điều khoản Sử dụng\n\n1. Giới thiệu...\n2. Quyền lợi...');
        setPrivacy('## Chính sách Bảo mật\n\n1. Dữ liệu chúng tôi thu thập...\n2. Cách sử dụng...');
      }
    } catch (error) {
      console.error("Error fetching legal content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'configurations', 'legal'), {
        termsOfService: terms,
        privacyPolicy: privacy,
        updatedAt: Timestamp.now(),
        updatedBy: 'admin', // Could take from auth
      });
      setLastUpdated(new Date());
      alert('Đã lưu nội dung pháp lý thành công!');
    } catch (error) {
      console.error("Error saving legal content:", error);
      alert('Lỗi khi lưu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Điều khoản & Bảo mật</h2>
          <p className="text-text-secondary mt-1">Soạn thảo nội dung pháp lý hiển thị trên App Mobile</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 shadow-lg shadow-brand-primary/20"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <span className="material-symbols-outlined">save</span>
          )}
          Lưu thay đổi
        </button>
      </div>

      {lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-text-muted bg-bg-panel px-4 py-2 rounded-lg border border-border-base w-fit">
          <span className="material-symbols-outlined text-base">schedule</span>
          Cập nhật lần cuối: {lastUpdated.toLocaleString('vi-VN')}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Terms of Service Section */}
        <div className="flex flex-col bg-bg-panel rounded-2xl border border-border-base overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border-base bg-bg-subtle flex items-center justify-between">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary">gavel</span>
              Điều khoản Sử dụng (ToS)
            </h3>
            <span className="text-xs text-text-muted bg-bg-panel px-2 py-1 rounded border border-border-base">Markdown Supported</span>
          </div>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="flex-1 w-full bg-bg-panel p-4 text-text-primary resize-none outline-none focus:bg-bg-subtle/30 transition-colors font-mono text-sm leading-relaxed"
            placeholder="Nhập nội dung điều khoản..."
          />
        </div>

        {/* Privacy Policy Section */}
        <div className="flex flex-col bg-bg-panel rounded-2xl border border-border-base overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border-base bg-bg-subtle flex items-center justify-between">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">lock</span>
              Chính sách Bảo mật (Privacy)
            </h3>
            <span className="text-xs text-text-muted bg-bg-panel px-2 py-1 rounded border border-border-base">Markdown Supported</span>
          </div>
          <textarea
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="flex-1 w-full bg-bg-panel p-4 text-text-primary resize-none outline-none focus:bg-bg-subtle/30 transition-colors font-mono text-sm leading-relaxed"
            placeholder="Nhập nội dung chính sách bảo mật..."
          />
        </div>
      </div>
    </div>
  );
};

export default LegalSettings;
