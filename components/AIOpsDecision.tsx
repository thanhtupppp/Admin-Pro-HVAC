import React, { useState, useEffect } from 'react';

interface AIUsageData {
    requestsUsed: number;
    requestsLimit: number;
    tokensInput: number;
    tokensOutput: number;
    estimatedCost: number;
    model: string;
}

const AIOpsDecision: React.FC = () => {
    const [usage, setUsage] = useState<AIUsageData>({
        requestsUsed: 45,
        requestsLimit: 100,
        tokensInput: 125000,
        tokensOutput: 32000,
        estimatedCost: 12.5,
        model: 'gemini-2.5-flash'
    });

    const usagePercentage = (usage.requestsUsed / usage.requestsLimit) * 100;

    const getColorByUsage = (percentage: number) => {
        if (percentage < 70) return { bar: 'bg-green-500', text: 'text-green-500', bg: 'bg-green-500/10' };
        if (percentage < 90) return { bar: 'bg-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500/10' };
        return { bar: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-500/10' };
    };

    const colors = getColorByUsage(usagePercentage);

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">AI Ops Dashboard</h1>
                <p className="text-text-secondary text-sm">Giám sát sử dụng và chi phí Gemini API</p>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Quota Usage */}
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-secondary text-sm font-medium">Quota Sử Dụng</span>
                        <span className={`material-symbols-outlined ${colors.text}`}>analytics</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-white">{usage.requestsUsed}</span>
                        <span className="text-text-secondary text-sm">/ {usage.requestsLimit}</span>
                    </div>
                    <p className="text-xs text-text-secondary">requests tháng này</p>
                </div>

                {/* Input Tokens */}
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-secondary text-sm font-medium">Input Tokens</span>
                        <span className="material-symbols-outlined text-blue-500">input</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-white">{(usage.tokensInput / 1000).toFixed(1)}K</span>
                    </div>
                    <p className="text-xs text-text-secondary">tokens đầu vào</p>
                </div>

                {/* Output Tokens */}
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-secondary text-sm font-medium">Output Tokens</span>
                        <span className="material-symbols-outlined text-purple-500">output</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-white">{(usage.tokensOutput / 1000).toFixed(1)}K</span>
                    </div>
                    <p className="text-xs text-text-secondary">tokens đầu ra</p>
                </div>

                {/* Estimated Cost */}
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-secondary text-sm font-medium">Chi Phí Ước Tính</span>
                        <span className="material-symbols-outlined text-amber-500">payments</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-white">${usage.estimatedCost}</span>
                    </div>
                    <p className="text-xs text-text-secondary">USD tháng này</p>
                </div>
            </div>

            {/* Quota Progress Bar */}
            <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Quota Progress</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors.bg} ${colors.text}`}>
                        {usagePercentage.toFixed(1)}%
                    </span>
                </div>

                <div className="relative w-full h-4 bg-background-dark rounded-full overflow-hidden">
                    <div
                        className={`absolute left-0 top-0 h-full ${colors.bar} transition-all duration-500`}
                        style={{ width: `${usagePercentage}%` }}
                    />
                </div>

                <div className="flex justify-between text-xs text-text-secondary mt-2">
                    <span>{usage.requestsUsed} requests đã dùng</span>
                    <span>{usage.requestsLimit - usage.requestsUsed} còn lại</span>
                </div>

                {usagePercentage > 85 && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
                            <div>
                                <p className="text-sm font-bold text-red-500">Cảnh báo: Sắp đạt giới hạn!</p>
                                <p className="text-xs text-red-400 mt-1">
                                    Bạn đã sử dụng {usagePercentage.toFixed(1)}% quota. Hãy cân nhắc nâng cấp gói hoặc hạn chế sử dụng.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Model Info & Pricing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Model */}
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Model Hiện Tại</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl">
                            <span className="text-white font-mono font-bold">{usage.model}</span>
                            <span className="material-symbols-outlined text-primary">check_circle</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-text-secondary">Input Token Cost</p>
                                <p className="text-white font-bold">$0.075 / 1M</p>
                            </div>
                            <div>
                                <p className="text-text-secondary">Output Token Cost</p>
                                <p className="text-white font-bold">$0.30 / 1M</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Hành Động Nhanh</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                            <span className="text-white text-sm font-medium">Xem Chi Tiết Pricing</span>
                            <span className="material-symbols-outlined text-text-secondary">open_in_new</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                            <span className="text-white text-sm font-medium">Cài Đặt Cảnh Báo</span>
                            <span className="material-symbols-outlined text-text-secondary">notifications</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                            <span className="text-white text-sm font-medium">Xuất Báo Cáo Sử Dụng</span>
                            <span className="material-symbols-outlined text-text-secondary">download</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Usage Tips */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
                    Mẹo Tối Ưu Chi Phí
                </h4>
                <ul className="space-y-2 text-xs text-text-secondary">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Sử dụng <strong>gemini-2.5-flash</strong> cho các tác vụ đơn giản (rẻ hơn 60% so với Pro)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Giảm <strong>thinking budget</strong> nếu không cần xử lý PDF phức tạp</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span>Cache kết quả phân tích thường dùng để tránh gọi API lặp lại</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default AIOpsDecision;
