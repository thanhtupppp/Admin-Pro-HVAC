import React, { useState, useEffect } from 'react';
import { couponService } from '../services/couponService';
import { Coupon } from '../types';

const CouponManager: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        const data = await couponService.getCoupons();
        setCoupons(data);
    };

    const handleOpenModal = (coupon?: Coupon) => {
        setEditingCoupon(coupon || null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCoupon(null);
    };

    const handleSave = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingCoupon) {
            await couponService.updateCoupon(editingCoupon.id, couponData);
        } else {
            await couponService.createCoupon(couponData);
        }
        await loadCoupons();
        handleCloseModal();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc muốn vô hiệu hóa mã giảm giá này?')) {
            await couponService.deleteCoupon(id);
            await loadCoupons();
        }
    };

    const getStatusBadge = (status: Coupon['status']) => {
        switch (status) {
            case 'active':
                return <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold rounded-full">Hoạt động</span>;
            case 'expired':
                return <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold rounded-full">Hết hạn</span>;
            case 'disabled':
                return <span className="px-3 py-1 bg-gray-500/10 text-gray-500 border border-gray-500/20 text-xs font-bold rounded-full">Đã tắt</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white">Mã giảm giá</h3>
                    <p className="text-xs text-text-secondary">Tạo và quản lý mã khuyến mãi cho khách hàng</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tạo mã mới
                </button>
            </div>

            {/* Coupons Table */}
            <div className="bg-surface-dark border border-border-dark/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-background-dark/50 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4 text-left">Mã code</th>
                            <th className="px-6 py-4 text-left">Giảm giá</th>
                            <th className="px-6 py-4 text-left">Hiệu lực</th>
                            <th className="px-6 py-4 text-center">Sử dụng</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark/20">
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="material-symbols-outlined text-4xl text-text-secondary/30">receipt_long</span>
                                        <p className="text-sm text-text-secondary">Chưa có mã giảm giá nào</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            coupons.map((coupon) => (
                                <tr key={coupon.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-bold text-white font-mono">{coupon.code}</p>
                                            {coupon.description && (
                                                <p className="text-xs text-text-secondary">{coupon.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-primary">
                                            {coupon.discountType === 'percent'
                                                ? `-${coupon.discountValue}%`
                                                : `-${coupon.discountValue.toLocaleString()}₫`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-text-secondary">
                                            <p>{new Date(coupon.validFrom).toLocaleDateString('vi-VN')}</p>
                                            <p>→ {new Date(coupon.validTo).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-white">
                                            {coupon.usedCount} / {coupon.usageLimit}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(coupon.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(coupon)}
                                                className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <CouponModal
                    coupon={editingCoupon}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

// Coupon Modal Component
interface CouponModalProps {
    coupon: Coupon | null;
    onClose: () => void;
    onSave: (data: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ coupon, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>>({
        code: '',
        discountType: 'percent',
        discountValue: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: 100,
        usedCount: 0,
        status: 'active',
        applicablePlans: [],
        description: ''
    });

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                validFrom: coupon.validFrom.split('T')[0],
                validTo: coupon.validTo.split('T')[0],
                usageLimit: coupon.usageLimit,
                usedCount: coupon.usedCount,
                status: coupon.status,
                applicablePlans: coupon.applicablePlans || [],
                description: coupon.description || ''
            });
        }
    }, [coupon]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            validFrom: new Date(formData.validFrom).toISOString(),
            validTo: new Date(formData.validTo).toISOString()
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-xl" onClick={onClose}></div>
            <div
                className="relative bg-surface-dark border border-border-dark rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                style={{ backgroundColor: 'rgb(28, 32, 39)' }}
            >
                {/* Header */}
                <div
                    className="px-8 py-6 border-b border-border-dark/30 flex items-center justify-between"
                    style={{ backgroundColor: 'rgb(16, 24, 34)' }}
                >
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {coupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
                        </h3>
                        <p className="text-xs text-text-secondary mt-1">Cấu hình mã khuyến mãi cho khách hàng</p>
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
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Mã code
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="SUMMER2024"
                                required
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Loại giảm giá
                            </label>
                            <select
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            >
                                <option value="percent">Phần trăm (%)</option>
                                <option value="fixed">Số tiền cố định (₫)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Giá trị giảm
                            </label>
                            <input
                                type="number"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                                placeholder={formData.discountType === 'percent' ? '50' : '50000'}
                                required
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Giới hạn sử dụng
                            </label>
                            <input
                                type="number"
                                value={formData.usageLimit}
                                onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                                required
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Hiệu lực từ
                            </label>
                            <input
                                type="date"
                                value={formData.validFrom}
                                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                                Hiệu lực đến
                            </label>
                            <input
                                type="date"
                                value={formData.validTo}
                                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                                required
                                className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Khuyến mãi mùa hè 2024"
                            rows={2}
                            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">save</span>
                            {coupon ? 'Cập nhật' : 'Tạo mã'}
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

export default CouponManager;
