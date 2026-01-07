import React, { useState, useEffect } from 'react';
import { claimService } from '../services/claimService';
import { ClaimsStats, ClaimTimeline, ClaimStatus } from '../types/claim';

const ClaimsAnalytics: React.FC = () => {
    const [stats, setStats] = useState<ClaimsStats | null>(null);
    const [timeline, setTimeline] = useState<ClaimTimeline[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        loadAnalytics();
    }, [dateRange]);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            const [statsData, timelineData] = await Promise.all([
                claimService.getClaimsStats(),
                claimService.getClaimsTimeline(parseInt(dateRange))
            ]);
            setStats(statsData);
            setTimeline(timelineData);
        } catch (error) {
            console.error('Không thể tải analytics', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: ClaimStatus) => {
        const colors: Record<ClaimStatus, string> = {
            draft: '#6B7280',
            submitted: '#3B82F6',
            in_review: '#F59E0B',
            pending_approval: '#F97316',
            approved: '#10B981',
            rejected: '#EF4444',
            cancelled: '#6B7280'
        };
        return colors[status];
    };

    const getStatusLabel = (status: ClaimStatus) => {
        const labels: Record<ClaimStatus, string> = {
            draft: 'Nháp',
            submitted: 'Đã gửi',
            in_review: 'Đang xem xét',
            pending_approval: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối',
            cancelled: 'Đã hủy'
        };
        return labels[status];
    };

    if (isLoading || !stats) {
        return (
            <div className="p-6">
                <div className="text-center py-16">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                        progress_activity
                    </span>
                    <p className="text-text-secondary mt-4">Đang tải analytics...</p>
                </div>
            </div>
        );
    }

    const maxTimelineValue = Math.max(...timeline.map(t => t.count), 1);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Claims Analytics</h1>
                    <p className="text-text-secondary">
                        Phân tích chi tiết về claims và hiệu suất xử lý
                    </p>
                </div>

                {/* Date Range Selector */}
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
                    className="px-4 py-2 bg-surface-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                >
                    <option value="7d">7 ngày qua</option>
                    <option value="30d">30 ngày qua</option>
                    <option value="90d">90 ngày qua</option>
                </select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-text-secondary text-sm">Tổng Claims</div>
                        <span className="material-symbols-outlined text-blue-400">inventory</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
                    <div className="text-xs text-text-muted">Tất cả thời gian</div>
                </div>

                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-text-secondary text-sm">Tổng số tiền</div>
                        <span className="material-symbols-outlined text-green-400">payments</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {(stats.totalAmount / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-text-muted">
                        TB: {(stats.averageAmount / 1000).toFixed(0)}K
                    </div>
                </div>

                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-text-secondary text-sm">Tỷ lệ duyệt</div>
                        <span className="material-symbols-outlined text-purple-400">trending_up</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {stats.approvalRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-400">
                        Auto: {stats.autoApprovalRate.toFixed(1)}%
                    </div>
                </div>

                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-text-secondary text-sm">Thời gian xử lý TB</div>
                        <span className="material-symbols-outlined text-orange-400">schedule</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        {stats.averageProcessingTime.toFixed(1)}h
                    </div>
                    <div className="text-xs text-text-muted">Trung bình</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Phân bố theo trạng thái</h3>

                    <div className="space-y-3">
                        {Object.entries(stats.byStatus).map(([status, count]) => {
                            if (count === 0) return null;
                            const percentage = stats.total > 0 ? ((count as number) / stats.total) * 100 : 0;

                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-white flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: getStatusColor(status as ClaimStatus) }}
                                            />
                                            {getStatusLabel(status as ClaimStatus)}
                                        </span>
                                        <span className="text-sm font-bold text-white">
                                            {count} ({percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-background-dark rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: getStatusColor(status as ClaimStatus)
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Claims by Type */}
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Phân bố theo loại</h3>

                    <div className="space-y-3">
                        {Object.entries(stats.byType).map(([type, count]) => {
                            const percentage = stats.total > 0 ? ((count as number) / stats.total) * 100 : 0;
                            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
                            const colorIndex = Object.keys(stats.byType).indexOf(type);

                            return (
                                <div key={type}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-white capitalize">{type}</span>
                                        <span className="text-sm font-bold text-white">
                                            {count} ({percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-background-dark rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: colors[colorIndex % colors.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Timeline Chart */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Xu hướng theo thời gian</h3>

                {timeline.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                        Chưa có dữ liệu
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Volume Chart */}
                        <div>
                            <div className="text-xs text-text-secondary mb-2">Số lượng claims</div>
                            <div className="flex items-end gap-2 h-32">
                                {timeline.slice(-15).map((item, idx) => {
                                    const height = (item.count / maxTimelineValue) * 100;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="flex-1 w-full flex items-end">
                                                <div
                                                    className="w-full bg-primary rounded-t transition-all hover:bg-primary-hover cursor-pointer"
                                                    style={{ height: `${height}%` }}
                                                    title={`${item.date}: ${item.count} claims`}
                                                />
                                            </div>
                                            <div className="text-xs text-text-muted rotate-45 origin-left mt-4">
                                                {new Date(item.date).getDate()}/{new Date(item.date).getMonth() + 1}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined">download</span>
                    Xuất báo cáo PDF
                </button>
            </div>
        </div>
    );
};

export default ClaimsAnalytics;
