import React, { useState, useEffect } from 'react';
import { claimService } from '../services/claimService';
import { Claim, ClaimStatus } from '../types/claim';

const ClaimsList: React.FC = () => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

    useEffect(() => {
        loadClaims();
    }, [statusFilter]);

    const loadClaims = async () => {
        setIsLoading(true);
        try {
            const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
            const data = await claimService.getClaims(filters);
            setClaims(data);
        } catch (error) {
            console.error('Failed to load claims', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (claimId: string, newStatus: ClaimStatus) => {
        try {
            await claimService.updateClaimStatus(claimId, newStatus);
            loadClaims(); // Refresh list
        } catch (error) {
            alert('Không thể cập nhật trạng thái');
        }
    };

    const getStatusColor = (status: ClaimStatus) => {
        const colors: Record<ClaimStatus, string> = {
            draft: 'bg-gray-500/10 text-gray-400',
            submitted: 'bg-blue-500/10 text-blue-400',
            in_review: 'bg-yellow-500/10 text-yellow-400',
            pending_approval: 'bg-orange-500/10 text-orange-400',
            approved: 'bg-green-500/10 text-green-400',
            rejected: 'bg-red-500/10 text-red-400',
            cancelled: 'bg-gray-500/10 text-gray-400'
        };
        return colors[status] || 'bg-gray-500/10 text-gray-400';
    };

    const getStatusLabel = (status: ClaimStatus) => {
        const labels: Record<ClaimStatus, string> = {
            draft: 'Nháp',
            submitted: 'Đã gửi',
            in_review: 'Đang xem xét',
            pending_approval: 'Chờ phê duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối',
            cancelled: 'Đã hủy'
        };
        return labels[status];
    };

    const filteredClaims = claims.filter(claim => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                claim.claimNumber.toLowerCase().includes(query) ||
                claim.customerName.toLowerCase().includes(query) ||
                claim.description.toLowerCase().includes(query)
            );
        }
        return true;
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Quản lý Claims</h1>
                    <p className="text-text-secondary">
                        Theo dõi và xử lý các yêu cầu bồi thường
                    </p>
                </div>
                <button className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined">add</span>
                    Tạo claim mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-4 flex items-center gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã claim, khách hàng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white placeholder-text-muted focus:border-primary focus:outline-none"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
                    className="px-4 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:border-primary focus:outline-none"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="submitted">Đã gửi</option>
                    <option value="in_review">Đang xem xét</option>
                    <option value="pending_approval">Chờ phê duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                </select>
            </div>

            {/* Claims Table */}
            {isLoading ? (
                <div className="text-center py-16">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                        progress_activity
                    </span>
                    <p className="text-text-secondary mt-4">Đang tải...</p>
                </div>
            ) : filteredClaims.length === 0 ? (
                <div className="text-center py-16 bg-surface-dark border border-border-dark rounded-2xl">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-text-secondary">Không có claim nào</p>
                </div>
            ) : (
                <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-background-dark/50 border-b border-border-dark">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                                    Mã claim
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                                    Khách hàng
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                                    Loại
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                                    Số tiền
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                                    Ngày gửi
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark">
                            {filteredClaims.map((claim) => (
                                <tr
                                    key={claim.id}
                                    className="hover:bg-white/5 transition-colors cursor-pointer"
                                    onClick={() => setSelectedClaim(claim)}
                                >
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-primary font-bold">
                                            {claim.claimNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{claim.customerName}</div>
                                        <div className="text-xs text-text-muted">{claim.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white capitalize">{claim.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white font-bold">
                                            {claim.amount.toLocaleString('vi-VN')}đ
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                                            {getStatusLabel(claim.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-text-secondary text-sm">
                                            {claim.submittedAt
                                                ? new Date(claim.submittedAt).toLocaleDateString('vi-VN')
                                                : '—'
                                            }
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {claim.status === 'submitted' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(claim.id, 'in_review');
                                                    }}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Bắt đầu xem xét"
                                                >
                                                    <span className="material-symbols-outlined text-sm text-blue-400">
                                                        visibility
                                                    </span>
                                                </button>
                                            )}
                                            {claim.status === 'in_review' && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusUpdate(claim.id, 'approved');
                                                        }}
                                                        className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                                        title="Phê duyệt"
                                                    >
                                                        <span className="material-symbols-outlined text-sm text-green-400">
                                                            check_circle
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusUpdate(claim.id, 'rejected');
                                                        }}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="Từ chối"
                                                    >
                                                        <span className="material-symbols-outlined text-sm text-red-400">
                                                            cancel
                                                        </span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
                    <div className="text-text-secondary text-sm mb-1">Tổng claims</div>
                    <div className="text-2xl font-bold text-white">{claims.length}</div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
                    <div className="text-text-secondary text-sm mb-1">Chờ duyệt</div>
                    <div className="text-2xl font-bold text-orange-400">
                        {claims.filter(c => c.status === 'pending_approval').length}
                    </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
                    <div className="text-text-secondary text-sm mb-1">Đã duyệt</div>
                    <div className="text-2xl font-bold text-green-400">
                        {claims.filter(c => c.status === 'approved').length}
                    </div>
                </div>
                <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
                    <div className="text-text-secondary text-sm mb-1">Từ chối</div>
                    <div className="text-2xl font-bold text-red-400">
                        {claims.filter(c => c.status === 'rejected').length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClaimsList;
