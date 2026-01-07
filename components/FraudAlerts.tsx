import React, { useState, useEffect } from 'react';
import { fraudService } from '../services/fraudService';
import { FraudAlert, FraudStats } from '../types/fraud';

const FraudAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<FraudAlert[]>([]);
    const [stats, setStats] = useState<FraudStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

    useEffect(() => {
        loadData();
    }, [statusFilter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [alertsData, statsData] = await Promise.all([
                fraudService.getAlerts(statusFilter !== 'all' ? { status: statusFilter } : undefined),
                fraudService.getStats()
            ]);
            setAlerts(alertsData);
            setStats(statsData);
        } catch (error) {
            console.error('Không thể tải fraud alerts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvestigate = async (alertId: string) => {
        try {
            await fraudService.updateAlert(alertId, {
                status: 'investigating',
                investigatedBy: 'current-user-id' // Replace with actual user
            });
            loadData();
        } catch (error) {
            alert('Không thể cập nhật trạng thái');
        }
    };

    const handleResolve = async (alertId: string, isFraud: boolean) => {
        try {
            await fraudService.updateAlert(alertId, {
                status: isFraud ? 'confirmed' : 'false_positive',
                resolvedAt: new Date().toISOString()
            });
            loadData();
        } catch (error) {
            alert('Không thể cập nhật trạng thái');
        }
    };

    const getSeverityColor = (severity: string) => {
        const colors: Record<string, string> = {
            low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            critical: 'bg-red-500/10 text-red-400 border-red-500/20'
        };
        return colors[severity] || colors.low;
    };

    const getAlertTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            duplicate_claim: 'Claims trùng lặp',
            unusual_amount: 'Số tiền bất thường',
            frequent_claims: 'Tần suất cao',
            suspicious_pattern: 'Mẫu đáng ngờ',
            identity_mismatch: 'Thông tin không khớp',
            timing_anomaly: 'Thời gian bất thường'
        };
        return labels[type] || type;
    };

    const getRiskScoreColor = (score: number) => {
        if (score >= 80) return 'text-red-400';
        if (score >= 60) return 'text-orange-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-blue-400';
    };

    if (isLoading || !stats) {
        return (
            <div className="p-6">
                <div className="text-center py-16">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                        progress_activity
                    </span>
                    <p className="text-text-secondary mt-4">Đang tải fraud alerts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Fraud Detection</h1>
                    <p className="text-text-secondary">
                        Phát hiện và ngăn chặn gian lận với AI
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${stats.openAlerts > 0 ? 'bg-red-500/10 text-red-400 animate-pulse' : 'bg-green-500/10 text-green-400'
                        }`}>
                        {stats.openAlerts} cảnh báo mới
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-text-secondary text-sm">Tổng cảnh báo</div>
                        <span className="material-symbols-outlined text-blue-400">warning</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.totalAlerts}</div>
                    <div className="text-xs text-text-muted">Tất cả thời gian</div>
                </div>

                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-text-secondary text-sm">Đang mở</div>
                        <span className="material-symbols-outlined text-orange-400">notifications_active</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-400 mb-1">{stats.openAlerts}</div>
                    <div className="text-xs text-text-muted">Cần xem xét</div>
                </div>

                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-text-secondary text-sm">Xác nhận gian lận</div>
                        <span className="material-symbols-outlined text-red-400">gpp_bad</span>
                    </div>
                    <div className="text-3xl font-bold text-red-400 mb-1">{stats.confirmedFraud}</div>
                    <div className="text-xs text-green-400">
                        FP: {stats.falsePositives}
                    </div>
                </div>

                <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-text-secondary text-sm">Risk Score TB</div>
                        <span className="material-symbols-outlined text-purple-400">analytics</span>
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${getRiskScoreColor(stats.averageRiskScore)}`}>
                        {stats.averageRiskScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-text-muted">Trên 100</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-4 flex items-center gap-4">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="open">Đang mở</option>
                    <option value="investigating">Đang điều tra</option>
                    <option value="confirmed">Xác nhận gian lận</option>
                    <option value="false_positive">False Positive</option>
                    <option value="resolved">Đã xử lý</option>
                </select>
            </div>

            {/* Alerts List */}
            {alerts.length === 0 ? (
                <div className="text-center py-16 bg-surface-dark border border-border-dark rounded-2xl">
                    <div className="text-6xl mb-4">🛡️</div>
                    <p className="text-text-secondary">Không có cảnh báo nào</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="bg-surface-dark border border-border-dark rounded-2xl p-6 hover:border-white/20 transition-all"
                        >
                            {/* Alert Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(alert.severity)}`}>
                                            {alert.severity.toUpperCase()}
                                        </span>
                                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-white">
                                            {getAlertTypeLabel(alert.alertType)}
                                        </span>
                                        <span className="font-mono text-sm text-primary font-bold">
                                            {alert.claimNumber}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-text-secondary">
                                            Phát hiện: {new Date(alert.detectedAt).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                </div>

                                {/* Risk Score Gauge */}
                                <div className="text-center">
                                    <div className={`text-4xl font-bold ${getRiskScoreColor(alert.riskScore)}`}>
                                        {alert.riskScore}
                                    </div>
                                    <div className="text-xs text-text-muted">Risk Score</div>
                                    <div className="w-24 h-2 bg-background-dark rounded-full mt-2 overflow-hidden">
                                        <div
                                            className={`h-full ${alert.riskScore >= 80 ? 'bg-red-400' :
                                                    alert.riskScore >= 60 ? 'bg-orange-400' :
                                                        alert.riskScore >= 40 ? 'bg-yellow-400' : 'bg-blue-400'
                                                }`}
                                            style={{ width: `${alert.riskScore}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fraud Reasons */}
                            <div className="mb-4">
                                <div className="text-xs font-bold text-text-secondary uppercase mb-2">
                                    Lý do cảnh báo
                                </div>
                                <div className="space-y-2">
                                    {alert.reasons.map((reason, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                            <span className="material-symbols-outlined text-xs text-red-400">flag</span>
                                            <span className="text-white">{reason.description}</span>
                                            <span className="text-text-muted text-xs">
                                                (Weight: {reason.weight})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t border-border-dark">
                                {alert.status === 'open' && (
                                    <>
                                        <button
                                            onClick={() => handleInvestigate(alert.id)}
                                            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium rounded-lg transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">search</span>
                                            Điều tra
                                        </button>
                                        <button
                                            onClick={() => setSelectedAlert(alert)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-all"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </>
                                )}
                                {alert.status === 'investigating' && (
                                    <>
                                        <button
                                            onClick={() => handleResolve(alert.id, true)}
                                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-lg transition-all"
                                        >
                                            Xác nhận gian lận
                                        </button>
                                        <button
                                            onClick={() => handleResolve(alert.id, false)}
                                            className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-medium rounded-lg transition-all"
                                        >
                                            False Positive
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Severity Distribution */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Phân bố theo mức độ nghiêm trọng</h3>
                <div className="grid grid-cols-4 gap-4">
                    {Object.entries(stats.alertsBySeverity).map(([severity, count]) => (
                        <div key={severity} className="text-center">
                            <div className={`text-3xl font-bold mb-2 ${severity === 'critical' ? 'text-red-400' :
                                    severity === 'high' ? 'text-orange-400' :
                                        severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                                }`}>
                                {count}
                            </div>
                            <div className="text-sm text-text-secondary capitalize">{severity}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FraudAlerts;
