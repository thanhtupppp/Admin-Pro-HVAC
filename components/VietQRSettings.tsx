import React, { useState, useEffect } from 'react';
import { bankSettingsService } from '../services/bankSettingsService';
import { BankSettings } from '../types';

const VietQRSettings: React.FC = () => {
    const [settings, setSettings] = useState<BankSettings | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Omit<BankSettings, 'id' | 'updatedAt'>>({
        bankId: 'ICB',
        bankName: 'VietinBank',
        accountNumber: '',
        accountName: '',
        template: 'compact2',
        isActive: true,
        updatedBy: 'admin'
    });
    const [previewUrl, setPreviewUrl] = useState('');

    const banks = bankSettingsService.getSupportedBanks();

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        // Update preview QR when form changes
        updatePreview();
    }, [formData]);

    const loadSettings = async () => {
        const data = await bankSettingsService.getBankSettings();
        if (data) {
            setSettings(data);
            setFormData({
                bankId: data.bankId,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                accountName: data.accountName,
                template: data.template,
                isActive: data.isActive,
                updatedBy: 'admin'
            });
        }
    };

    const updatePreview = () => {
        const url = `https://img.vietqr.io/image/${formData.bankId}-${formData.accountNumber}-${formData.template}.png?amount=100000&addInfo=DEMO&accountName=${encodeURIComponent(formData.accountName)}`;
        setPreviewUrl(url);
    };

    const handleBankChange = (bankId: string) => {
        const bank = banks.find(b => b.id === bankId);
        setFormData({
            ...formData,
            bankId,
            bankName: bank?.name || bankId
        });
    };

    const handleSave = async () => {
        try {
            await bankSettingsService.updateBankSettings(formData, 'admin'); // TODO: Get from auth
            await loadSettings();
            setIsEditing(false);
            alert('✅ Đã lưu cấu hình VietQR!');
        } catch (e) {
            console.error('Failed to save settings:', e);
            alert('Lỗi khi lưu cấu hình');
        }
    };

    return (
        <div className="space-y-6 mt-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-white">Cấu hình VietQR</h3>
                    <p className="text-xs text-text-secondary">Thiết lập thông tin ngân hàng để nhận thanh toán</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                        Chỉnh sửa
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all"
                        >
                            Lưu
                        </button>
                        <button
                            onClick={() => { setIsEditing(false); loadSettings(); }}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-border-dark text-white font-bold rounded-xl transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                )}
            </div>

            {/* Form & Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Thông tin ngân hàng</h4>

                    {/* Bank Selection */}
                    <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                            Ngân hàng
                        </label>
                        <select
                            value={formData.bankId}
                            onChange={(e) => handleBankChange(e.target.value)}
                            disabled={!isEditing}
                            style={{ colorScheme: 'dark' }}
                            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                        >
                            {banks.map(bank => (
                                <option
                                    key={bank.id}
                                    value={bank.id}
                                    style={{ backgroundColor: '#1a1f2e', color: '#ffffff' }}
                                >
                                    {bank.name} ({bank.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Account Number */}
                    <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                            Số tài khoản
                        </label>
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            disabled={!isEditing}
                            placeholder="0123456789"
                            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm font-mono focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Account Name */}
                    <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                            Tên chủ tài khoản
                        </label>
                        <input
                            type="text"
                            value={formData.accountName}
                            onChange={(e) => setFormData({ ...formData, accountName: e.target.value.toUpperCase() })}
                            disabled={!isEditing}
                            placeholder="NGUYEN VAN A"
                            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm uppercase focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Template */}
                    <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                            Template QR
                        </label>
                        <select
                            value={formData.template}
                            onChange={(e) => setFormData({ ...formData, template: e.target.value as any })}
                            disabled={!isEditing}
                            style={{ colorScheme: 'dark' }}
                            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                        >
                            <option value="compact" style={{ backgroundColor: '#1a1f2e', color: '#ffffff' }}>Compact</option>
                            <option value="compact2" style={{ backgroundColor: '#1a1f2e', color: '#ffffff' }}>Compact 2 (Recommended)</option>
                            <option value="qr_only" style={{ backgroundColor: '#1a1f2e', color: '#ffffff' }}>QR Only</option>
                            <option value="print" style={{ backgroundColor: '#1a1f2e', color: '#ffffff' }}>Print</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            disabled={!isEditing}
                            className="w-5 h-5 rounded border-border-dark bg-background-dark checked:bg-primary disabled:opacity-50"
                        />
                        <label htmlFor="isActive" className="text-sm text-white font-medium">
                            Kích hoạt thanh toán VietQR
                        </label>
                    </div>
                </div>

                {/* Preview QR */}
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Preview QR Code</h4>
                    <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="VietQR Preview"
                                className="w-full max-w-sm rounded-xl"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/300?text=Invalid+Config';
                                }}
                            />
                        ) : (
                            <div className="text-center text-gray-400 py-12">
                                <span className="material-symbols-outlined text-6xl">qr_code</span>
                                <p className="text-sm mt-2">Nhập thông tin để xem preview</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-xs text-blue-400">
                            <span className="material-symbols-outlined text-[14px] align-middle">info</span>
                            {' '}QR code demo với số tiền 100,000₫
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Settings Info */}
            {settings && !isEditing && (
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Cấu hình hiện tại</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-text-secondary text-xs">Ngân hàng</p>
                            <p className="text-white font-mono">{settings.bankName}</p>
                        </div>
                        <div>
                            <p className="text-text-secondary text-xs">Số TK</p>
                            <p className="text-white font-mono">{settings.accountNumber}</p>
                        </div>
                        <div>
                            <p className="text-text-secondary text-xs">Chủ TK</p>
                            <p className="text-white font-mono text-xs">{settings.accountName}</p>
                        </div>
                        <div>
                            <p className="text-text-secondary text-xs">Cập nhật lần cuối</p>
                            <p className="text-white text-xs">{new Date(settings.updatedAt).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VietQRSettings;
