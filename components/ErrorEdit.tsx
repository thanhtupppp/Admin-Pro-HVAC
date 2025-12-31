
import React, { useState } from 'react';

interface ErrorEditProps {
  onCancel: () => void;
  onSave?: () => void;
}

const ErrorEdit: React.FC<ErrorEditProps> = ({ onCancel, onSave }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiPreview, setShowApiPreview] = useState(false);

  // Giả lập dữ liệu JSON mà API sẽ trả về cho Mobile App
  const apiPreviewData = {
    id: "E23-99",
    brand: "Samsung",
    model: "Inverter Series X",
    error_code: "E23",
    display_title: "Lỗi khóa cửa an toàn (Safe Door Lock Error)",
    technical_details: {
      symptom: "Máy báo lỗi ngay khi bắt đầu chu trình vắt hoặc sau khi xả nước. Đèn báo nháy liên tục.",
      cause: "Công tắc cửa bị hỏng, kẹt cơ hoặc tiếp điểm bị oxy hóa. Bo mạch không nhận được tín hiệu phản hồi.",
      repair_steps: [
        "Kiểm tra kết nối giắc cắm tại công tắc cửa xem có lỏng hay oxy hóa.",
        "Sử dụng đồng hồ vạn năng đo thông mạch 3 chân của công tắc.",
        "Thay thế công tắc cửa mới nếu hỏng hoặc xóa lỗi trên bo mạch."
      ],
      associated_components: [
        { id: "c1", name: "Khóa cửa điện tử", estimated_price: 150000 },
        { id: "c2", name: "Dây cáp tín hiệu", estimated_price: 45000 }
      ]
    },
    meta: {
      updated_at: "2023-10-12T08:30:00Z",
      severity_level: "critical"
    }
  };

  return (
    <div className="p-4 lg:p-8 pb-32 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 uppercase tracking-wider">Lỗi nghiêm trọng</span>
            <span className="text-text-secondary text-xs">ID: #E23-99</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Chỉnh sửa: Mã lỗi E23</h1>
          <p className="text-text-secondary text-sm mt-1">Hãng: Samsung • Model: Inverter Series X</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowApiPreview(true)}
            className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">api</span>
            Xem API Preview
          </button>
          <button className="px-4 py-2 rounded-xl bg-surface-dark border border-border-dark text-white text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">history</span>
            Lịch sử
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-border-dark/30 mb-8 sticky top-0 bg-background-dark/95 backdrop-blur z-10 pt-2">
        {[
          { id: 'general', label: 'Thông tin chung' },
          { id: 'diagnosis', label: 'Chẩn đoán & Nguyên nhân' },
          { id: 'repair', label: 'Quy trình sửa chữa' },
          { id: 'components', label: 'Linh kiện liên quan' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              const element = document.getElementById(tab.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className={`cursor-pointer pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Form Fields ... (Giữ nguyên các section cũ) */}
          <section className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 shadow-xl shadow-black/20">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Mã lỗi</label>
                <input type="text" defaultValue="E23" className="w-full bg-background-dark border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Model máy</label>
                <input type="text" defaultValue="Inverter Series X" className="w-full bg-background-dark border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Tiêu đề lỗi</label>
                <input type="text" defaultValue="Lỗi khóa cửa an toàn (Safe Door Lock Error)" className="w-full bg-background-dark border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
          </section>

          {/* Diagnosis & Cause Section */}
          <section id="diagnosis" className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 scroll-mt-24">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">monitor_heart</span>
              Chẩn đoán & Nguyên nhân
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Triệu chứng nhận biết</label>
                <textarea rows={3} className="w-full bg-background-dark border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" defaultValue="Máy báo lỗi ngay khi bắt đầu chu trình vắt hoặc sau khi xả nước. Đèn báo nháy liên tục." />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Nguyên nhân chi tiết</label>
                <textarea rows={3} className="w-full bg-background-dark border-border-dark rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" defaultValue="Công tắc cửa bị hỏng, kẹt cơ hoặc tiếp điểm bị oxy hóa. Bo mạch không nhận được tín hiệu phản hồi." />
              </div>
            </div>
          </section>

          {/* Repair Steps Section */}
          <section id="repair" className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 scroll-mt-24">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">build</span>
              Quy trình sửa chữa
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex gap-4">
                  <span className="w-8 h-8 rounded-lg bg-background-dark flex items-center justify-center font-bold text-text-secondary border border-border-dark shrink-0">{step}</span>
                  <input type="text" className="flex-1 bg-background-dark border-border-dark rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none" defaultValue={step === 1 ? "Kiểm tra kết nối giắc cắm tại công tắc cửa." : step === 2 ? "Đo thông mạch bằng đồng hồ vạn năng." : "Thay thế khóa cửa mới nếu cần."} />
                </div>
              ))}
              <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline pl-12">
                <span className="material-symbols-outlined text-lg">add</span>
                Thêm bước thực hiện
              </button>
            </div>
          </section>

          {/* Components & Tools Section */}
          <section id="components" className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 scroll-mt-24">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">inventory_2</span>
              Linh kiện & Công cụ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Linh kiện liên quan</label>
                <div className="flex flex-wrap gap-2">
                  {["Khóa cửa điện tử", "Dây cáp tín hiệu", "Bo mạch chính"].map((tag, i) => (
                    <span key={i} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                      {tag}
                      <button className="hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                    </span>
                  ))}
                  <button className="px-3 py-1.5 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Thêm
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Công cụ cần thiết</label>
                <div className="flex flex-wrap gap-2">
                  {["Tô vít 4 cạnh", "Đồng hồ VOM"].map((tag, i) => (
                    <span key={i} className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                      {tag}
                      <button className="hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                    </span>
                  ))}
                  <button className="px-3 py-1.5 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Trạng thái xuất bản</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Trạng thái:</span>
                <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded font-bold">Đã duyệt</span>
              </div>
              <button
                onClick={onSave}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                Lưu tất cả thay đổi
              </button>
              <button
                onClick={onCancel}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Preview Modal */}
      {showApiPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowApiPreview(false)}></div>
          <div className="relative bg-surface-dark border border-border-dark rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-border-dark/30 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400">code</span>
                  Mobile API Endpoint Preview
                </h3>
                <p className="text-xs text-text-secondary mt-1 font-mono">GET /api/errors/E23-99</p>
              </div>
              <button onClick={() => setShowApiPreview(false)} className="text-text-secondary hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scroll bg-background-dark/30">
              <div className="bg-black/40 rounded-3xl p-6 border border-border-dark/50 font-mono text-[11px] leading-relaxed text-blue-300">
                <pre>{JSON.stringify(apiPreviewData, null, 2)}</pre>
              </div>
            </div>
            <div className="p-8 border-t border-border-dark/30 flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(apiPreviewData, null, 2));
                  alert("Đã copy JSON để thiết kế API!");
                }}
                className="px-6 py-3 bg-primary/10 text-primary font-bold rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setShowApiPreview(false)}
                className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorEdit;
