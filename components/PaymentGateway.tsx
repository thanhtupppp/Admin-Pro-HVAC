import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { vietQRHelper, stripeHelper, paypalHelper } from '../utils/paymentHelpers';

interface PaymentGatewayProps {
    amount: number;
    orderId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, orderId, onSuccess, onCancel }) => {
    const [selectedMethod, setSelectedMethod] = useState<'vietqr' | 'stripe' | 'paypal'>('vietqr');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

    const handleVietQRPayment = async () => {
        setIsLoading(true);
        try {
            const qrUrl = vietQRHelper.generateQRCode(orderId, amount);
            setQrCodeUrl(qrUrl);
            setPaymentStatus('processing');

            // Poll for payment confirmation (simulate webhook)
            const checkInterval = setInterval(async () => {
                const verified = await vietQRHelper.verifyPayment(orderId, amount);
                if (verified) {
                    clearInterval(checkInterval);
                    setPaymentStatus('completed');
                    setTimeout(onSuccess, 1500);
                }
            }, 3000);

            // Timeout after 5 minutes
            setTimeout(() => {
                clearInterval(checkInterval);
                if (paymentStatus === 'processing') {
                    setPaymentStatus('failed');
                }
            }, 300000);
        } catch (error) {
            console.error('VietQR payment failed', error);
            setPaymentStatus('failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStripePayment = async () => {
        setIsLoading(true);
        try {
            const checkoutUrl = await stripeHelper.createCheckoutSession(orderId, amount);
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Stripe payment failed', error);
            alert('Không thể khởi tạo thanh toán Stripe');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayPalPayment = async () => {
        setIsLoading(true);
        try {
            const paypalUrl = await paypalHelper.createOrder(orderId, amount);
            window.location.href = paypalUrl;
        } catch (error) {
            console.error('PayPal payment failed', error);
            alert('Không thể khởi tạo thanh toán PayPal');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = () => {
        switch (selectedMethod) {
            case 'vietqr':
                handleVietQRPayment();
                break;
            case 'stripe':
                handleStripePayment();
                break;
            case 'paypal':
                handlePayPalPayment();
                break;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Thanh toán</h2>
                <p className="text-text-secondary">
                    Tổng thanh toán: <span className="text-primary font-bold text-xl">{amount.toLocaleString('vi-VN')}đ</span>
                </p>
            </div>

            {/* Payment Method Selection */}
            {paymentStatus === 'pending' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Chọn phương thức thanh toán</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* VietQR */}
                        <button
                            onClick={() => setSelectedMethod('vietqr')}
                            className={`p-4 rounded-xl border-2 transition-all ${selectedMethod === 'vietqr'
                                ? 'border-primary bg-primary/10'
                                : 'border-border-dark bg-surface-dark hover:border-white/20'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-3xl mb-2">🏦</div>
                                <div className="font-bold text-white">VietQR</div>
                                <div className="text-xs text-text-secondary mt-1">Quét mã QR</div>
                            </div>
                        </button>

                        {/* Stripe */}
                        <button
                            onClick={() => setSelectedMethod('stripe')}
                            className={`p-4 rounded-xl border-2 transition-all ${selectedMethod === 'stripe'
                                ? 'border-primary bg-primary/10'
                                : 'border-border-dark bg-surface-dark hover:border-white/20'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-3xl mb-2">💳</div>
                                <div className="font-bold text-white">Stripe</div>
                                <div className="text-xs text-text-secondary mt-1">Thẻ quốc tế</div>
                            </div>
                        </button>

                        {/* PayPal */}
                        <button
                            onClick={() => setSelectedMethod('paypal')}
                            className={`p-4 rounded-xl border-2 transition-all ${selectedMethod === 'paypal'
                                ? 'border-primary bg-primary/10'
                                : 'border-border-dark bg-surface-dark hover:border-white/20'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-3xl mb-2">🅿️</div>
                                <div className="font-bold text-white">PayPal</div>
                                <div className="text-xs text-text-secondary mt-1">Tài khoản PayPal</div>
                            </div>
                        </button>
                    </div>

                    {/* Payment Button */}
                    <button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">payment</span>
                                Thanh toán ngay
                            </>
                        )}
                    </button>

                    <button
                        onClick={onCancel}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white font-medium rounded-xl transition-all"
                    >
                        Hủy
                    </button>
                </div>
            )}

            {/* VietQR Display */}
            {paymentStatus === 'processing' && selectedMethod === 'vietqr' && qrCodeUrl && (
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 text-center space-y-6">
                    <h3 className="text-xl font-bold text-white">Quét mã QR để thanh toán</h3>

                    <div className="bg-white p-6 rounded-xl inline-block">
                        <img src={qrCodeUrl} alt="VietQR Code" className="w-64 h-64" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-text-secondary text-sm">
                            Mở ứng dụng ngân hàng và quét mã QR
                        </p>
                        <p className="text-primary font-bold">
                            Số tiền: {amount.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-text-muted text-xs font-mono">
                            Mã GD: {orderId}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-yellow-500 animate-pulse">
                        <span className="material-symbols-outlined">pending</span>
                        <span className="text-sm font-medium">Đang chờ thanh toán...</span>
                    </div>

                    <button
                        onClick={onCancel}
                        className="text-text-secondary hover:text-white text-sm underline"
                    >
                        Hủy giao dịch
                    </button>
                </div>
            )}

            {/* Success State */}
            {paymentStatus === 'completed' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center space-y-4">
                    <div className="text-6xl">✅</div>
                    <h3 className="text-2xl font-bold text-green-400">Thanh toán thành công!</h3>
                    <p className="text-text-secondary">Cảm ơn bạn đã sử dụng dịch vụ</p>
                </div>
            )}

            {/* Failed State */}
            {paymentStatus === 'failed' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
                    <div className="text-6xl">❌</div>
                    <h3 className="text-2xl font-bold text-red-400">Thanh toán thất bại</h3>
                    <p className="text-text-secondary">Vui lòng thử lại hoặc chọn phương thức khác</p>
                    <button
                        onClick={() => setPaymentStatus('pending')}
                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg"
                    >
                        Thử lại
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentGateway;
