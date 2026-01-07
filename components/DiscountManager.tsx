import React, { useState, useEffect } from 'react';
import { discountService } from '../services/discountService';
import { DiscountCode } from '../types/discount';

const DiscountManager: React.FC = () => {
    const [codes, setCodes] = useState<DiscountCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: 0,
        minPurchase: 0,
        maxDiscount: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: 0,
        status: 'active' as 'active' | 'inactive'
    });

    useEffect(() => {
        loadCodes();
    }, []);

    const loadCodes = async () => {
        setIsLoading(true);
        try {
            const data = await discountService.getAllCodes();
            setCodes(data.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (error) {
            console.error('Cannot load discount codes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingCode) {
                await discountService.updateCode(editingCode.id, formData);
            } else {
                await discountService.createCode({
                    ...formData,
                    createdBy: 'current-user-id', // Replace with actual user
                    usageLimit: formData.usageLimit || undefined,
                    applicablePlans: [] // Can be extended with multi-select
                });
            }

            resetForm();
            loadCodes();
            alert(editingCode ? 'Đã cập nhật' : 'Đã tạo mã giảm giá');
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleEdit = (code: DiscountCode) => {
        setEditingCode(code);
        setFormData({
            code: code.code,
            name: code.name,
            description: code.description,
            type: code.type,
            value: code.value,
            minPurchase: code.minPurchase || 0,
            maxDiscount: code.maxDiscount || 0,
            validFrom: code.validFrom.split('T')[0],
            validTo: code.validTo.split('T')[0],
            usageLimit: code.usageLimit || 0,
            status: code.status
        });
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa mã giảm giá này?')) return;

        try {
            await discountService.deleteCode(id);
            loadCodes();
        } catch (error) {
            alert('Không thể xóa');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            type: 'percentage',
            value: 0,
            minPurchase: 0,
            maxDiscount: 0,
            validFrom: new Date().toISOString().split('T')[0],
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            usageLimit: 0,
            status: 'active'
        });
        setEditingCode(null);
        setShowDialog(false);
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'text-green-400 bg-green-500/10' :
            status === 'expired' ? 'text-red-400 bg-red-500/10' :
                'text-gray-400 bg-gray-500/10';
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="text-center py-16">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                        progress_activity
                    </span>
                    <p className="text-text-secondary mt-4">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Mã Giảm Giá</h1>
                    <p className="text-text-secondary">Quản lý discount codes và promotions</p>
                </div>
                <button
                    onClick={() => setShowDialog(true)}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Tạo mã mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="text-text-secondary text-sm mb-2">Tổng mã</div>
                    <div className="text-3xl font-bold text-white">{codes.length}</div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="text-text-secondary text-sm mb-2">Đang hoạt động</div>
                    <div className="text-3xl font-bold text-green-400">
                        {codes.filter(c => c.status === 'active').length}
                    </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="text-text-secondary text-sm mb-2">Đã sử dụng</div>
                    <div className="text-3xl font-bold text-blue-400">
                        {codes.reduce((sum, c) => sum + c.usedCount, 0)}
                    </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="text-text-secondary text-sm mb-2">Hết hạn</div>
                    <div className="text-3xl font-bold text-red-400">
                        {codes.filter(c => c.status === 'expired').length}
                    </div>
                </div>
            </div>

            {/* Codes List */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-background-dark">
                        <tr>
                            <th className="text-left p-4 text-text-secondary font-medium text-sm">Mã</th>
                            <th className="text-left p-4 text-text-secondary font-medium text-sm">Tên</th>
                            <th className="text-left p-4 text-text-secondary font-medium text-sm">Giảm giá</th>
                            <th className="text-left p-4 text-text-secondary font-medium text-sm">Sử dụng</th>
                            <th className="text-left p-4 text-text-secondary font-medium text-sm">Hạn sử dụng</th>
                            <th className="text-left p-4 text-text-secondary font-medium text-sm">Trạng thái</th>
                            <th className="text-left p-4 text-text-secondary font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {codes.map((code) => (
                            <tr key={code.id} className="border-t border-border-dark hover:bg-white/5">
                                <td className="p-4">
                                    <div className="font-mono font-bold text-primary">{code.code}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-white font-medium">{code.name}</div>
                                    <div className="text-xs text-text-muted">{code.description}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-white font-bold">
                                        {code.type === 'percentage'
                                            ? `${code.value}%`
                                            : `${code.value.toLocaleString('vi-VN')}đ`
                                        }
                                    </div>
                                    {code.maxDiscount && (
                                        <div className="text-xs text-text-muted">
                                            Max: {code.maxDiscount.toLocaleString('vi-VN')}đ
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="text-white">
                                        {code.usedCount}
                                        {code.usageLimit && ` / ${code.usageLimit}`}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-white text-sm">
                                        {new Date(code.validTo).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(code.status)}`}>
                                        {code.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(code)}
                                            className="p-2 hover:bg-white/10 rounded transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <span className="material-symbols-outlined text-sm text-white">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(code.id)}
                                            className="p-2 hover:bg-red-500/20 rounded transition-colors"
                                            title="Xóa"
                                        >
                                            <span className="material-symbols-outlined text-sm text-red-400">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {codes.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-3">🎟️</div>
                        <p className="text-text-secondary">Chưa có mã giảm giá nào</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            {showDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-6">
                            {editingCode ? 'Chỉnh sửa mã' : 'Tạo mã giảm giá'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Mã *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="SUMMER2026"
                                        className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white font-mono focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Tên hiển thị *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Summer Sale"
                                        className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Giảm giá mùa hè..."
                                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Loại *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                                    >
                                        <option value="percentage">Phần trăm (%)</option>
                                        <option value="fixed">Số tiền cố định</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Giá trị *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max={formData.type === 'percentage' ? 100 : undefined}
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Giảm tối đa</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                                        placeholder="0 = unlimited"
                                        className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Đơn tối thiểu</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minPurchase}
                                        onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Giới hạn sử dụng</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                                        placeholder="0 = unlimited"
                                        className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Từ ngày *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                        className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Đến ngày *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.validTo}
                                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                                        className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">Trạng thái</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Tạm dừng</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all"
                                >
                                    {editingCode ? 'Cập nhật' : 'Tạo mã'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountManager;
