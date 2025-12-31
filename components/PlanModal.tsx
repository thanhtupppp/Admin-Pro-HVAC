import React, { useState, useEffect } from 'react';
import { Plan, PlanFeature, planService } from '../services/planService';

interface PlanModalProps {
    plan: Plan | null; // null = create new, otherwise edit
    onClose: () => void;
    onSave: () => void;
}

const PlanModal: React.FC<PlanModalProps> = ({ plan, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>>({
        name: '',
        displayName: '',
        price: 0,
        billingCycle: 'monthly',
        tier: 'Premium',
        description: '',
        features: [],
        badge: '',
        badgeColor: 'primary',
        popular: false,
        status: 'active'
    });

    const [featureInput, setFeatureInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (plan) {
            // Edit mode - populate form
            setFormData({
                name: plan.name,
                displayName: plan.displayName,
                price: plan.price,
                billingCycle: plan.billingCycle,
                tier: plan.tier || 'Premium',
                description: plan.description,
                features: plan.features || [], // Safe fallback
                badge: plan.badge || '',
                badgeColor: plan.badgeColor || 'primary',
                popular: plan.popular || false,
                status: plan.status
            });
        }
    }, [plan]);

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), { label: featureInput.trim(), enabled: true }]
            }));
            setFeatureInput('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleToggleFeature = (index: number) => {
        setFormData(prev => {
            const updated = [...prev.features];
            updated[index].enabled = !updated[index].enabled;
            return { ...prev, features: updated };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (plan) {
                // Update existing plan
                await planService.updatePlan(plan.id, formData);
            } else {
                // Create new plan
                await planService.createPlan(formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save plan:', error);
            alert('Lỗi khi lưu gói dịch vụ. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-xl" onClick={onClose}></div>
            <div
                className="relative bg-surface-dark border border-border-dark rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                style={{ backgroundColor: 'rgb(28, 32, 39)' }}
            >
                {/* Header */}
                <div
                    className="px-8 py-6 border-b border-border-dark/30 flex items-center justify-between"
                    style={{ backgroundColor: 'rgb(16, 24, 34)' }}
                >
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {plan ? 'Chỉnh sửa gói dịch vụ' : 'Tạo gói dịch vụ mới'}
                        </h3>
                        <p className="text-xs text-text-secondary mt-1">
                            Cấu hình giá, chu kỳ và quyền lợi cho người dùng
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scroll">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Tên gói (Internal)
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="free"
                                required
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Tên hiển thị
                            </label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                placeholder="Gói Miễn phí"
                                required
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Price, Billing & Tier */}
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Giá (VNĐ)
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                placeholder="199000"
                                required
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Chu kỳ
                            </label>
                            <select
                                value={formData.billingCycle}
                                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })}
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="monthly">Tháng</option>
                                <option value="yearly">Năm</option>
                                <option value="lifetime">Trọn đời</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Loại gói (Tier)
                            </label>
                            <select
                                value={formData.tier}
                                onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="Free">Free</option>
                                <option value="Premium">Premium</option>
                                <option value="Internal">Internal</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                            Mô tả
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Dành cho kỹ thuật viên mới"
                            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Badge & Status */}
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Badge
                            </label>
                            <input
                                type="text"
                                value={formData.badge}
                                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                placeholder="Phổ biến nhất"
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="flex items-end gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.popular}
                                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                    className="w-4 h-4 rounded border-border-dark bg-background-dark checked:bg-primary"
                                />
                                <span className="text-sm text-white">Popular</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                            Quyền lợi & Tính năng
                        </label>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                placeholder="Nhập tính năng..."
                                className="flex-1 px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                            <button
                                type="button"
                                onClick={handleAddFeature}
                                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors"
                            >
                                Thêm
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-background-dark/50 border border-border-dark/50 rounded-xl"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleToggleFeature(index)}
                                        className={`flex-shrink-0 ${feature.enabled ? 'text-green-500' : 'text-gray-600'}`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {feature.enabled ? 'check_circle' : 'cancel'}
                                        </span>
                                    </button>
                                    <span className={`flex-1 text-sm ${feature.enabled ? 'text-white' : 'text-gray-500 line-through'}`}>
                                        {feature.label}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFeature(index)}
                                        className="text-red-500 hover:text-red-400 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">save</span>
                                    {plan ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-border-dark rounded-2xl text-white font-bold transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanModal;
