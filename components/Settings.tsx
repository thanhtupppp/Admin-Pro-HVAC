
import React, { useState, useEffect } from 'react';

// Added onSave to props interface to fix type error in App.tsx
interface SettingsProps {
  onSave?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onSave }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      // Check if global aistudio helper is available
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleUpdateKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        // Open the secure platform key selector dialog
        await window.aistudio.openSelectKey();
        // Assume key selection was successful to update UI immediately
        setHasKey(true);
      } catch (error) {
        console.error("Failed to open key selector", error);
      }
    }
  };

  const SECTIONS = [
    { id: 'general', label: 'Hệ thống', icon: 'settings' },
    { id: 'ai', label: 'Cấu hình AI', icon: 'psychology' },
    { id: 'notification', label: 'Thông báo', icon: 'notifications' },
    { id: 'security', label: 'Bảo mật', icon: 'security' },
    { id: 'backup', label: 'Sao lưu', icon: 'cloud_sync' },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-6xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === s.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              <span className="text-sm font-bold">{s.label}</span>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeSection === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-surface-dark border border-border-dark/30 rounded-3xl p-8 space-y-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">info</span>
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Tên ứng dụng</label>
                      <input type="text" defaultValue="Admin Pro Console" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Phiên bản hệ thống</label>
                      <input type="text" defaultValue="v3.2.0-stable" disabled className="w-full bg-background-dark/50 border border-border-dark rounded-xl px-4 py-3 text-text-secondary cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background-dark/50 rounded-2xl border border-border-dark/30">
                    <div>
                      <p className="text-sm font-bold text-white">Chế độ bảo trì</p>
                      <p className="text-xs text-text-secondary">Tạm thời vô hiệu hóa truy cập của người dùng ứng dụng</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                       <input type="checkbox" className="sr-only peer" />
                       <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-surface-dark border border-border-dark/30 rounded-3xl p-8 space-y-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">psychology</span>
                    Gemini AI Model Configuration
                  </h3>

                  {/* Secure API Key Management Section */}
                  <div className="p-5 bg-background-dark/50 rounded-2xl border border-border-dark/30 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white">Quản lý API Key</h4>
                        <p className="text-[10px] text-text-secondary mt-1">Cấu hình chìa khóa truy cập bảo mật cho các tác vụ xử lý nâng cao.</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${hasKey ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-current ${hasKey ? 'animate-pulse' : ''}`}></span>
                        {hasKey ? 'Đã kết nối' : 'Chưa thiết lập'}
                      </div>
                    </div>

                    <div className="relative">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 block">Cấu hình Chìa khóa (Masked for Security)</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <input 
                            type="password" 
                            value="********************************" 
                            disabled 
                            className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-text-secondary cursor-not-allowed opacity-60 font-mono" 
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-sm">lock</span>
                        </div>
                        <button 
                          onClick={handleUpdateKey}
                          className="px-6 py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-[20px]">vpn_key</span>
                          {hasKey ? 'Thay đổi Key' : 'Thiết lập ngay'}
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] text-text-secondary leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-primary font-bold">Lưu ý:</span> Bạn cần chọn một API Key từ một dự án Google Cloud đã được kích hoạt thanh toán (Paid Project). 
                      Thông tin chi tiết về các hạn mức và chi phí có thể tìm thấy tại <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">Tài liệu thanh toán Gemini</a>.
                    </p>
                  </div>
                  
                  <div className="space-y-6 pt-4 border-t border-border-dark/20">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Thinking Budget (Tokens)</label>
                        <span className="text-xs font-bold text-primary">32,768</span>
                      </div>
                      <input type="range" min="0" max="65536" step="1024" className="w-full h-1.5 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary" />
                      <p className="text-[10px] text-text-secondary italic">Tăng ngân sách giúp AI xử lý các tài liệu kỹ thuật PDF phức tạp tốt hơn nhưng sẽ tăng độ trễ.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Model mặc định</label>
                      <select className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none">
                        <option>gemini-3-pro-preview (Khuyên dùng)</option>
                        <option>gemini-3-flash-preview</option>
                        <option>gemini-2.5-flash-lite-latest</option>
                      </select>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-surface-dark border border-border-dark/30 rounded-3xl p-8 space-y-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">lock</span>
                    Đổi mật khẩu Admin
                  </h3>
                  <div className="space-y-4">
                    <input type="password" placeholder="Mật khẩu hiện tại" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white outline-none" />
                    <input type="password" placeholder="Mật khẩu mới" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white outline-none" />
                    <input type="password" placeholder="Xác nhận mật khẩu mới" className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white outline-none" />
                    <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                      Cập nhật mật khẩu
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 md:right-10 flex gap-4">
         <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-border-dark transition-all">
            Hủy bỏ
         </button>
         {/* Added onSave call to sync with App state */}
         <button 
           onClick={onSave}
           className="px-10 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-2xl shadow-primary/30 transition-all flex items-center gap-2"
         >
            <span className="material-symbols-outlined text-[20px]">save</span>
            Lưu thay đổi
         </button>
      </div>
    </div>
  );
};

export default Settings;
