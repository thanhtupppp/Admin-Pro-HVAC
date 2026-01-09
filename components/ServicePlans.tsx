import React, { useState, useEffect } from 'react';
import { planService, PricingPlan } from '../services/planService';

const ServicePlans: React.FC = () => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setIsLoading(true);
        try {
            let data = await planService.getPlans();
            if (data.length === 0) {
                await planService.initializeDefaultPlans();
                data = await planService.getPlans();
            }
            setPlans(data);
        } catch (error) {
            console.error('Failed to load plans', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPrice = (plan: PricingPlan) => {
        if (plan.price === 0) return 'Miễn phí';
        const price = billingCycle === 'annual' ? plan.price * 12 * 0.8 : plan.price;
        return billingCycle === 'annual'
            ? `${(price / 12).toLocaleString('vi-VN')}đ/tháng`
            : `${price.toLocaleString('vi-VN')}đ/tháng`;
    };

    const getAnnualSavings = (plan: PricingPlan) => {
        if (plan.price === 0) return null;
        const savings = plan.price * 12 * 0.2;
        return `Tiết kiệm ${savings.toLocaleString('vi-VN')}đ/năm`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-pulse-slow text-brand-primary text-4xl mb-4">●</div>
                    <p className="text-text-secondary text-sm">Đang tải gói dịch vụ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-white">Chọn gói phù hợp với bạn</h1>
                <p className="text-text-secondary max-w-2xl mx-auto">
                    Nâng cấp để mở khóa đầy đủ tính năng Admin Pro HVAC và tối ưu hóa quản lý doanh nghiệp
                </p>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${billingCycle === 'monthly'
                                ? 'bg-primary text-white'
                                : 'bg-surface-dark text-text-secondary hover:bg-white/5'
                            }`}
                    >
                        Thanh toán hàng tháng
                    </button>
                    <button
                        onClick={() => setBillingCycle('annual')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${billingCycle === 'annual'
                                ? 'bg-primary text-white'
                                : 'bg-surface-dark text-text-secondary hover:bg-white/5'
                            }`}
                    >
                        Thanh toán hàng năm
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                            -20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-surface-dark border rounded-2xl p-8 relative transition-all ${plan.name === 'Pro'
                                ? 'border-primary shadow-xl shadow-primary/20 scale-105'
                                : 'border-border-dark hover:border-white/20'
                            }`}
                    >
                        {/* Popular Badge */}
                        {plan.name === 'Pro' && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="px-4 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                                    PHỔ BIẾN NHẤT
                                </span>
                            </div>
                        )}

                        {/* Plan Name */}
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-text-secondary text-sm">{plan.description}</p>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-8">
                            <div className="text-4xl font-bold text-white mb-2">
                                {getPrice(plan)}
                            </div>
                            {billingCycle === 'annual' && plan.price > 0 && (
                                <p className="text-sm text-green-400">{getAnnualSavings(plan)}</p>
                            )}
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-8">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-green-500 text-xl flex-shrink-0 mt-0.5">
                                        check_circle
                                    </span>
                                    <span className="text-text-secondary text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <button
                            className={`w-full py-3 rounded-xl font-bold transition-all ${plan.name === 'Pro'
                                    ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30'
                                    : plan.price === 0
                                        ? 'bg-white/5 hover:bg-white/10 text-white border border-border-dark'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            {plan.price === 0 ? 'Gói hiện tại' : 'Nâng cấp ngay'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Feature Comparison Table */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    So sánh chi tiết các gói
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-dark">
                                <th className="text-left py-4 px-4 text-text-secondary font-bold">Tính năng</th>
                                {plans.map(plan => (
                                    <th key={plan.id} className="text-center py-4 px-4">
                                        <div className="text-white font-bold">{plan.name}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark/30">
                            <tr>
                                <td className="py-4 px-4 text-text-secondary">Quản lý mã lỗi</td>
                                <td className="text-center py-4 px-4 text-text-secondary">50 mã</td>
                                <td className="text-center py-4 px-4 text-green-400">500 mã</td>
                                <td className="text-center py-4 px-4 text-green-400">Không giới hạn</td>
                            </tr>
                            <tr>
                                <td className="py-4 px-4 text-text-secondary">AI Smart Import</td>
                                <td className="text-center py-4 px-4"><span className="text-red-400">✗</span></td>
                                <td className="text-center py-4 px-4"><span className="text-green-400">✓</span></td>
                                <td className="text-center py-4 px-4"><span className="text-green-400">✓</span></td>
                            </tr>
                            <tr>
                                <td className="py-4 px-4 text-text-secondary">Field Dispatch</td>
                                <td className="text-center py-4 px-4"><span className="text-red-400">✗</span></td>
                                <td className="text-center py-4 px-4"><span className="text-green-400">✓</span></td>
                                <td className="text-center py-4 px-4"><span className="text-green-400">✓</span></td>
                            </tr>
                            <tr>
                                <td className="py-4 px-4 text-text-secondary">Priority Support</td>
                                <td className="text-center py-4 px-4"><span className="text-red-400">✗</span></td>
                                <td className="text-center py-4 px-4">Email</td>
                                <td className="text-center py-4 px-4">24/7 Phone + Email</td>
                            </tr>
                            <tr>
                                <td className="py-4 px-4 text-text-secondary">Custom Branding</td>
                                <td className="text-center py-4 px-4"><span className="text-red-400">✗</span></td>
                                <td className="text-center py-4 px-4"><span className="text-red-400">✗</span></td>
                                <td className="text-center py-4 px-4"><span className="text-green-400">✓</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">help</span>
                    Câu hỏi thường gặp
                </h3>
                <div className="space-y-3 text-sm text-text-secondary">
                    <p><strong className="text-white">Q: Tôi có thể thay đổi gói sau khi đăng ký không?</strong><br />
                        A: Có, bạn có thể nâng cấp hoặc hạ cấp bất cứ lúc nào. Phí sẽ được tính theo tỷ lệ.</p>

                    <p><strong className="text-white">Q: Thanh toán hàng năm có được hoàn tiền không?</strong><br />
                        A: Có, chúng tôi có chính sách hoàn tiền trong 30 ngày đầu tiên.</p>

                    <p><strong className="text-white">Q: Gói Enterprise có gì khác biệt?</strong><br />
                        A: Gói Enterprise bao gồm custom branding, dedicated support, và SLA đảm bảo 9.9% uptime.</p>
                </div>
            </div>
        </div>
    );
};

export default ServicePlans;
