import React, { useState, useEffect } from 'react';
import { paymentGatewayService, VietQRPayment, VIETNAM_BANKS } from '../services/paymentGatewayService';

interface VietQRDisplayProps {
    transactionId: string;
    amount: number;
    paymentCode: string;
    onCancel: () => void;
}

const VietQRDisplay: React.FC<VietQRDisplayProps> = ({
    transactionId,
    amount,
    paymentCode,
    onCancel
}) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [selectedBank, setSelectedBank] = useState(VIETNAM_BANKS[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Default account info (should come from settings)
    const accountInfo = {
        accountNo: '1034567890',
        accountName: 'ADMIN PRO HVAC'
    };

    useEffect(() => {
        generateQR();
    }, [selectedBank]);

    const generateQR = async () => {
        setIsGenerating(true);
        try {
            const payment: VietQRPayment = {
                accountNo: accountInfo.accountNo,
                accountName: accountInfo.accountName,
                bankId: selectedBank.id,
                bankName: selectedBank.name,
                amount,
                description: paymentCode
            };

            const qrUrl = await paymentGatewayService.generateVietQR(payment);
            setQrCodeUrl(qrUrl);
        } catch (error) {
            alert('Không thể tạo mã QR. Vui lòng thử lại.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Thanh toán qua VietQR</h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <span className="material-symbols-outlined text-text-secondary">close</span>
                    </button>
                </div>

                {/* Bank Selector */}
                <div className="mb-6">
                    <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">
                        Chọn ngân hàng
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {VIETNAM_BANKS.map((bank) => (
                            <button
                                key={bank.id}
                                onClick={() => setSelectedBank(bank)}
                                className={`p-3 rounded-xl border-2 transition-all ${selectedBank.id === bank.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border-dark hover:border-primary/50'
                                    }`}
                            >
                                <p className="text-xs font-bold text-white">{bank.id}</p>
                                <p className="text-[10px] text-text-secondary truncate">{bank.name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* QR Code */}
                    <div className="flex flex-col items-center">
                        <div className="bg-white p-4 rounded-2xl mb-4">
                            {isGenerating ? (
                                <div className="w-[400px] h-[400px] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-6xl text-gray-400 animate-spin">
                                        progress_activity
                                    </span>
                                </div>
                            ) : qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="VietQR Code" className="w-[400px] h-[400px]" />
                            ) : (
                                <div className="w-[400px] h-[400px]"></div>
                            )}
                        </div>
                        <p className="text-xs text-text-secondary text-center">
                            Quét mã QR bằng app ngân hàng của bạn
                        </p>
                    </div>

                    {/* Transfer Info */}
                    <div className="space-y-4">
                        <div className="bg-background-dark rounded-xl p-4">
                            <p className="text-xs text-text-secondary mb-2">Ngân hàng</p>
                            <p className="text-white font-bold">{selectedBank.name}</p>
                        </div>

                        <div className="bg-background-dark rounded-xl p-4">
                            <p className="text-xs text-text-secondary mb-2">Số tài khoản</p>
                            <div className="flex items-center justify-between">
                                <p className="text-white font-bold font-mono">{accountInfo.accountNo}</p>
                                <button
                                    onClick={() => copyToClipboard(accountInfo.accountNo)}
                                    className="text-primary hover:text-primary-hover"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {copied ? 'check' : 'content_copy'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-background-dark rounded-xl p-4">
                            <p className="text-xs text-text-secondary mb-2">Chủ tài khoản</p>
                            <p className="text-white font-bold">{accountInfo.accountName}</p>
                        </div>

                        <div className="bg-background-dark rounded-xl p-4">
                            <p className="text-xs text-text-secondary mb-2">Số tiền</p>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold text-primary">
                                    {amount.toLocaleString('vi-VN')} VNĐ
                                </p>
                                <button
                                    onClick={() => copyToClipboard(amount.toString())}
                                    className="text-primary hover:text-primary-hover"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {copied ? 'check' : 'content_copy'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-background-dark rounded-xl p-4">
                            <p className="text-xs text-text-secondary mb-2">
                                Nội dung chuyển khoản{' '}
                                <span className="text-red-500">*</span>
                            </p>
                            <div className="flex items-center justify-between">
                                <p className="text-white font-bold font-mono">{paymentCode}</p>
                                <button
                                    onClick={() => copyToClipboard(paymentCode)}
                                    className="text-primary hover:text-primary-hover"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {copied ? 'check' : 'content_copy'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-yellow-500 text-[20px] mt-0.5">
                                    warning
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-yellow-500 mb-1">Lưu ý quan trọng</p>
                                    <p className="text-xs text-yellow-400">
                                        Vui lòng nhập CHÍNH XÁC nội dung chuyển khoản để hệ thống xác nhận thanh toán tự động.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        Hướng dẫn thanh toán
                    </h3>
                    <ol className="space-y-2 text-xs text-text-secondary list-decimal list-inside">
                        <li>Mở app ngân hàng và chọn "Chuyển khoản" hoặc "Quét QR"</li>
                        <li>Quét mã QR ở trên hoặc nhập thông tin chuyển khoản thủ công</li>
                        <li>Kiểm tra số tiền và nội dung chuyển khoản</li>
                        <li>Xác nhận giao dịch</li>
                        <li>Chờ admin xác nhận (thường trong vòng 1-24 giờ)</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default VietQRDisplay;
