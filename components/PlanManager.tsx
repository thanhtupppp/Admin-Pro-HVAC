import React, { useState, useEffect } from 'react';
import { paymentService, Plan } from '../services/paymentService';
// We might want to use userService for metrics in the future, but for now focus on Plans.

interface PaymentInfo {
  planName: string;
  price: number;
  description: string;
}

const PlanManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showPayment, setShowPayment] = useState<PaymentInfo | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'verifying' | 'success'>('waiting');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const data = await paymentService.getPlans();
    setPlans(data);
  };

  // Thông tin ngân hàng cấu hình (Demo)
  const BANK_CONFIG = {
    ID: 'ICB', // VietinBank
    ACCOUNT_NO: '102874563321',
    ACCOUNT_NAME: 'CONG TY CONG NGHE ADMIN PRO',
    TEMPLATE: 'compact2'
  };

  const handleOpenPayment = (name: string, price: number) => {
    const desc = `THANH TOAN GOI ${name.toUpperCase()} ID${Math.floor(Math.random() * 10000)}`;
    setShowPayment({ planName: name, price, description: desc });
    setPaymentStatus('waiting');
  };

  const handleConfirmPayment = async () => {
    if (!showPayment) return;
    setPaymentStatus('verifying');

    // Call service to record transaction
    try {
      await paymentService.createTransaction({
        userId: 'current-admin', // TODO: Get from auth context
        planId: showPayment.planName,
        amount: showPayment.price,
        status: 'completed',
        method: 'bank_transfer',
        description: showPayment.description
      });
      setPaymentStatus('success');
    } catch (e) {
      console.error(e);
      setPaymentStatus('waiting'); // Retry?
    }
  };

  // URL VietQR
  const qrUrl = showPayment
    ? `https://img.vietqr.io/image/${BANK_CONFIG.ID}-${BANK_CONFIG.ACCOUNT_NO}-${BANK_CONFIG.TEMPLATE}.png?amount=${showPayment.price}&addInfo=${encodeURIComponent(showPayment.description)}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`
    : '';

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản lý Gói dịch vụ</h1>
          <p className="text-text-secondary text-sm">Cấu hình giá cả và quyền hạn cho người dùng ứng dụng</p>
        </div>
        <div className="flex bg-surface-dark border border-border-dark p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'plans' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
          >
            Danh sách gói
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'coupons' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
          >
            Mã giảm giá
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Người dùng Premium', value: '1,240', sub: '+18% tháng này', color: 'blue', icon: 'star' },
          { label: 'Doanh thu tháng (MRR)', value: '145.2M', sub: '₫ VNĐ', color: 'green', icon: 'payments' },
          { label: 'Tỷ lệ chuyển đổi', value: '8.4%', sub: 'Từ gói Free', color: 'purple', icon: 'trending_up' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 hover:border-primary/30 transition-all cursor-default group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 border border-${stat.color}-500/20`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-green-500 font-medium">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Render Plans Dynamically or Keep Static Layout for Better UI Control? 
            Let's iterate plans but keep the nice layout logic. 
            For now, I'll match the previous hardcoded layout but use data where applicable or fallback to the static nice UI 
            because the MOCK_PLANS are simple. 
            Actually, the previous UI was very custom for Free/Premium. Let's keep it but wire the button.
        */}

        {/* FREE PLAN */}
        <div className="bg-surface-dark border-2 border-border-dark/30 rounded-3xl p-8 relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[120px]">eco</span>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Gói Miễn phí (Free)</h3>
                <p className="text-text-secondary text-xs">Dành cho kỹ thuật viên mới</p>
              </div>
              <span className="bg-white/5 border border-border-dark text-[10px] font-bold px-3 py-1 rounded-full text-white uppercase tracking-wider">Mặc định</span>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-bold text-white">0₫</span>
              <span className="text-text-secondary text-sm"> / vĩnh viễn</span>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-xs font-bold text-white uppercase tracking-widest border-b border-border-dark/30 pb-2">Quyền lợi bao gồm:</p>
              {[
                { label: 'Tra cứu mã lỗi cơ bản', active: true },
                { label: 'Quét OCR giới hạn (5 lần/ngày)', active: true },
                { label: 'Xem lịch sử lỗi cá nhân', active: true },
                { label: 'Hỗ trợ kỹ thuật nâng cao', active: false },
                { label: 'Tải tài liệu hướng dẫn (PDF)', active: false },
              ].map((f, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm ${f.active ? 'text-gray-300' : 'text-gray-500 italic'}`}>
                  <span className={`material-symbols-outlined text-[18px] ${f.active ? 'text-green-500' : 'text-gray-600'}`}>
                    {f.active ? 'check_circle' : 'cancel'}
                  </span>
                  {f.label}
                </div>
              ))}
            </div>

            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-border-dark rounded-2xl text-white font-bold text-sm transition-all">
              Chỉnh sửa quyền lợi
            </button>
          </div>
        </div>

        {/* PREMIUM PLAN */}
        <div className="bg-surface-dark border-2 border-primary/50 rounded-3xl p-8 relative overflow-hidden group hover:border-primary transition-all shadow-2xl shadow-primary/5">
          <div className="absolute top-0 right-0 p-8 text-primary opacity-10 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[120px]">workspace_premium</span>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Gói Chuyên nghiệp (Premium)</h3>
                <p className="text-text-secondary text-xs">Full quyền năng cho thợ chuyên nghiệp</p>
              </div>
              <span className="bg-primary/20 border border-primary/30 text-[10px] font-bold px-3 py-1 rounded-full text-primary uppercase tracking-wider">Phổ biến nhất</span>
            </div>

            <div className="mb-8 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">199.000₫</span>
              <span className="text-text-secondary text-sm"> / tháng</span>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-xs font-bold text-primary uppercase tracking-widest border-b border-primary/20 pb-2">Quyền lợi bao gồm:</p>
              {[
                { label: 'Tra cứu toàn bộ kho mã lỗi AI', active: true },
                { label: 'Quét OCR không giới hạn', active: true },
                { label: 'Hỗ trợ ưu tiên từ chuyên gia 24/7', active: true },
                { label: 'Tải PDF Manual bản quyền', active: true },
                { label: 'Phân tích linh kiện thay thế AI', active: true },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-100">
                  <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
                  {f.label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleOpenPayment('Premium', 199000)}
                className="py-4 bg-primary hover:bg-primary-hover rounded-2xl text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">qr_code_2</span>
                Thanh toán ngay
              </button>
              <button className="py-4 bg-white/5 hover:bg-white/10 border border-border-dark rounded-2xl text-white font-bold text-sm transition-all">
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VietQR Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-xl" onClick={() => setShowPayment(null)}></div>
          <div className="relative bg-surface-dark border border-border-dark/50 rounded-[3rem] w-full max-w-2xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* QR Side */}
              <div className="p-10 bg-white flex flex-col items-center justify-center space-y-4">
                <div className="w-full aspect-square bg-gray-50 rounded-3xl p-4 border border-gray-100 flex items-center justify-center">
                  <img src={qrUrl} alt="VietQR" className="w-full h-full object-contain" />
                </div>
                <div className="flex items-center gap-2">
                  <img src="https://vietqr.net/portal-v2/images/img/logo-vietqr.png" alt="VietQR Logo" className="h-6" />
                  <div className="w-px h-4 bg-gray-300"></div>
                  <img src="https://napas.com.vn/en/images/logo.png" alt="Napas" className="h-4" />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sử dụng ứng dụng Ngân hàng để quét</p>
              </div>

              {/* Info Side */}
              <div className="p-10 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">Thanh toán Gói</h3>
                      <p className="text-primary font-bold text-sm tracking-wide">{showPayment.planName} Subscription</p>
                    </div>
                    <button onClick={() => setShowPayment(null)} className="text-text-secondary hover:text-white transition-colors">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-background-dark/50 rounded-2xl p-4 border border-border-dark/30 space-y-1">
                      <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Số tiền cần thanh toán</p>
                      <p className="text-2xl font-bold text-white">{showPayment.price.toLocaleString()}₫</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] text-text-secondary uppercase font-bold tracking-widest mb-1">Tài khoản thụ hưởng</p>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-xs text-white font-mono">{BANK_CONFIG.ACCOUNT_NO}</span>
                          <button onClick={() => navigator.clipboard.writeText(BANK_CONFIG.ACCOUNT_NO)} className="text-primary hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] text-text-secondary uppercase font-bold tracking-widest mb-1">Nội dung chuyển khoản</p>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-xs text-amber-400 font-mono font-bold">{showPayment.description}</span>
                          <button onClick={() => navigator.clipboard.writeText(showPayment.description)} className="text-primary hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {paymentStatus === 'waiting' && (
                    <button
                      onClick={handleConfirmPayment}
                      className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      Tôi đã chuyển khoản xong
                    </button>
                  )}
                  {paymentStatus === 'verifying' && (
                    <div className="w-full py-4 bg-white/5 border border-primary/30 text-primary font-bold rounded-2xl flex items-center justify-center gap-3">
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      Đang xác thực giao dịch...
                    </div>
                  )}
                  {paymentStatus === 'success' && (
                    <div className="w-full py-4 bg-green-500/10 border border-green-500/30 text-green-500 font-bold rounded-2xl flex items-center justify-center gap-3 animate-in zoom-in-95">
                      <span className="material-symbols-outlined">verified</span>
                      Nâng cấp thành công!
                      <button onClick={() => setShowPayment(null)} className="ml-2 underline text-[10px]">Đóng</button>
                    </div>
                  )}
                  <p className="text-center text-[9px] text-text-secondary italic">Hệ thống sẽ tự động kích hoạt sau khi nhận được tiền.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Permissions Matrix */}
      <section className="bg-surface-dark border border-border-dark/50 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-border-dark/30 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Ma trận tính năng chi tiết</h3>
          <button className="text-xs font-bold text-primary hover:underline">Lưu thay đổi ma trận</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background-dark/50 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Tính năng chi tiết</th>
                <th className="px-8 py-4 text-center">Free</th>
                <th className="px-8 py-4 text-center">Premium</th>
                <th className="px-8 py-4 text-right">Loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark/20">
              {[
                { name: 'Truy cập database mã lỗi', free: 'Basic', premium: 'Full', type: 'Database' },
                { name: 'Giới hạn quét OCR / ngày', free: '5', premium: 'Unlimited', type: 'AI Tool' },
                { name: 'Xuất file báo cáo PDF', free: 'No', premium: 'Yes', type: 'Reporting' },
                { name: 'Hỏi đáp chuyên gia (Ticket)', free: 'No', premium: 'Priority', type: 'Support' },
                { name: 'Xóa quảng cáo trong App', free: 'No', premium: 'Yes', type: 'Experience' },
              ].map((row, i) => (
                <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-5 text-sm font-medium text-white">{row.name}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${row.free === 'No' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-gray-400 border-border-dark'}`}>
                      {row.free}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {row.premium}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-[10px] text-text-secondary font-medium italic">{row.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PlanManager;
