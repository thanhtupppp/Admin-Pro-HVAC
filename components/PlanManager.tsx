import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { planService } from '../services/planService';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export interface ServicePlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxUsers: number;
    maxErrorCodes: number;
    aiQuota: number;
  };
  status: 'active' | 'inactive';
  isPopular?: boolean;
  description?: string;
  discount?: number; // For annual billing
}

const PlanManager: React.FC = () => {
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
  const [showAnnual, setShowAnnual] = useState(false);

  // Real-time plans subscription
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'servicePlans'),
      (snapshot) => {
        const plansData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ServicePlan[];
        setPlans(plansData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Plans fetch error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCreatePlan = () => {
    setEditingPlan({
      id: '',
      name: '',
      price: 0,
      billingCycle: 'monthly',
      features: [],
      limits: {
        maxUsers: 1,
        maxErrorCodes: 10,
        aiQuota: 100
      },
      status: 'active'
    });
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      if (editingPlan.id) {
        // Update existing
        await updateDoc(doc(db, 'servicePlans', editingPlan.id), editingPlan);
      } else {
        // Create new
        await addDoc(collection(db, 'servicePlans'), editingPlan);
      }
      setEditingPlan(null);
    } catch (error) {
      console.error('Save plan error:', error);
      alert('Không thể lưu gói dịch vụ');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Bạn có chắc muốn xóa gói này?')) return;

    try {
      await deleteDoc(doc(db, 'servicePlans', planId));
    } catch (error) {
      console.error('Delete plan error:', error);
      alert('Không thể xóa gói dịch vụ');
    }
  };

  const getDiscountedPrice = (plan: ServicePlan) => {
    if (showAnnual && plan.discount) {
      return plan.price * 12 * (1 - plan.discount / 100);
    }
    return showAnnual ? plan.price * 12 : plan.price;
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Gói Dịch Vụ</h1>
          <p className="text-text-secondary text-sm mt-1">Cấu hình pricing và tính năng cho từng gói</p>
        </div>
        <button
          onClick={handleCreatePlan}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo gói mới
        </button>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3 p-1 bg-surface-dark rounded-xl w-fit mx-auto">
        <button
          onClick={() => setShowAnnual(false)}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${!showAnnual ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
            }`}
        >
          Hàng tháng
        </button>
        <button
          onClick={() => setShowAnnual(true)}
          className={`px-6 py-2 rounded-lg font-bold transition-all ${showAnnual ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
            }`}
        >
          Hàng năm
          <span className="ml-2 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">-20%</span>
        </button>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 animate-pulse">
              <div className="h-64"></div>
            </div>
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-secondary">
             <div className="mb-4">
               <span className="material-symbols-outlined text-4xl text-gray-600">inbox</span>
             </div>
             <p className="mb-4">Chưa có gói dịch vụ nào</p>
             <button 
                onClick={async () => {
                    if(confirm('Bạn có muốn khởi tạo các gói mặc định (Free, Basic, Premium, Enterprise)?')) {
                        await planService.initializeDefaultPlans();
                    }
                }}
                className="px-6 py-2 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary/80 transition-all"
             >
                Khởi tạo Gói Mặc định
             </button>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-surface-dark border rounded-2xl p-6 relative ${plan.isPopular
                  ? 'border-primary shadow-lg shadow-primary/20'
                  : 'border-border-dark/50 hover:border-primary/20'
                } transition-all`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-xs font-bold">
                  PHỔ BIẾN NHẤT
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    {getDiscountedPrice(plan).toLocaleString('vi-VN')}
                  </span>
                  <span className="text-text-secondary">VNĐ</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {showAnnual ? 'mỗi năm' : 'mỗi tháng'}
                </p>
                {showAnnual && plan.discount && (
                  <p className="text-xs text-green-500 mt-1">
                    Tiết kiệm {plan.discount}%
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Limits */}
              <div className="space-y-2 mb-6 p-4 bg-background-dark rounded-xl">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Users</span>
                  <span className="text-white font-bold">{plan.limits.maxUsers}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Error Codes</span>
                  <span className="text-white font-bold">{plan.limits.maxErrorCodes}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">AI Quota</span>
                  <span className="text-white font-bold">{plan.limits.aiQuota}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingPlan.id ? 'Chỉnh sửa gói' : 'Tạo gói mới'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Tên gói</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Giá (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Giảm giá (%)</label>
                  <input
                    type="number"
                    value={editingPlan.discount || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, discount: Number(e.target.value) })}
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white mt-2"
                  />
                </div>
              </div>

                <div>
                    <label className="text-xs font-bold text-text-secondary uppercase">Mô tả ngắn</label>
                    <input
                      type="text"
                      value={editingPlan.description || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                      className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-white mt-2"
                      placeholder="VD: Dành cho cá nhân trải nghiệm..."
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Giới hạn sử dụng</label>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <span className="text-[10px] text-text-muted uppercase">Users</span>
                            <input
                                type="number"
                                value={editingPlan.limits.maxUsers}
                                onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, maxUsers: Number(e.target.value) } })}
                                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm mt-1"
                            />
                        </div>
                        <div>
                            <span className="text-[10px] text-text-muted uppercase">Errors</span>
                            <input
                                type="number"
                                value={editingPlan.limits.maxErrorCodes}
                                onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, maxErrorCodes: Number(e.target.value) } })}
                                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm mt-1"
                            />
                        </div>
                        <div>
                            <span className="text-[10px] text-text-muted uppercase">AI Quota</span>
                            <input
                                type="number"
                                value={editingPlan.limits.aiQuota}
                                onChange={(e) => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, aiQuota: Number(e.target.value) } })}
                                className="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm mt-1"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-text-secondary uppercase flex justify-between items-center mb-2">
                        Tính năng nổi bật
                        <button 
                            onClick={() => setEditingPlan({ ...editingPlan, features: [...editingPlan.features, ''] })}
                            className="text-primary hover:text-white text-xs"
                        >
                            + Thêm
                        </button>
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scroll">
                        {editingPlan.features.map((feature, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    value={feature}
                                    onChange={(e) => {
                                        const newFeatures = [...editingPlan.features];
                                        newFeatures[idx] = e.target.value;
                                        setEditingPlan({ ...editingPlan, features: newFeatures });
                                    }}
                                    className="flex-1 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm"
                                    placeholder="Nhập tính năng..."
                                />
                                <button
                                    onClick={() => {
                                        const newFeatures = editingPlan.features.filter((_, i) => i !== idx);
                                        setEditingPlan({ ...editingPlan, features: newFeatures });
                                    }}
                                    className="text-red-500 hover:text-red-400"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-background-dark p-3 rounded-xl border border-border-dark">
                    <input
                        type="checkbox"
                        id="isPopular"
                        checked={editingPlan.isPopular || false}
                        onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary bg-transparent"
                    />
                    <label htmlFor="isPopular" className="text-sm font-bold text-white select-none cursor-pointer">
                        Đánh dấu là "Phổ biến nhất" (Highlight)
                    </label>
                </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSavePlan}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl"
                >
                  Lưu
                </button>
                <button
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManager;
