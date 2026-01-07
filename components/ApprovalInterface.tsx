import React, { useState, useEffect } from 'react';
import { claimService } from '../services/claimService';
import { workflowService } from '../services/workflowService';
import { Claim, ApprovalChain, ApprovalDecision } from '../types/claim';

const ApprovalInterface: React.FC = () => {
    const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [approvalChain, setApprovalChain] = useState<ApprovalChain | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [comment, setComment] = useState('');

    const currentUserId = 'user-123'; // Replace with actual logged-in user
    const currentUserName = 'Admin User'; // Replace with actual user name

    useEffect(() => {
        loadPendingApprovals();
    }, []);

    useEffect(() => {
        if (selectedClaim) {
            loadApprovalChain(selectedClaim.id);
        }
    }, [selectedClaim]);

    const loadPendingApprovals = async () => {
        setIsLoading(true);
        try {
            const claims = await claimService.getPendingApprovals(currentUserId);
            setPendingClaims(claims);
        } catch (error) {
            console.error('Không thể tải pending approvals', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadApprovalChain = async (claimId: string) => {
        try {
            const chain = await workflowService.getApprovalChain(claimId);
            setApprovalChain(chain);
        } catch (error) {
            console.error('Không thể tải approval chain', error);
        }
    };

    const handleApproval = async (decision: ApprovalDecision) => {
        if (!selectedClaim || !approvalChain) return;

        try {
            await workflowService.submitApproval(
                approvalChain.id,
                currentUserId,
                currentUserName,
                decision,
                comment
            );

            // Update claim status if approved
            if (decision === 'approve') {
                await claimService.updateClaimStatus(selectedClaim.id, 'approved');
            } else if (decision === 'reject') {
                await claimService.updateClaimStatus(selectedClaim.id, 'rejected', comment);
            }

            // Reload data
            loadPendingApprovals();
            setSelectedClaim(null);
            setComment('');
            alert('Đã gửi quyết định phê duyệt');
        } catch (error) {
            alert('Không thể gửi quyết định');
        }
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
                    <h1 className="text-2xl font-bold text-white mb-2">Phê duyệt Claims</h1>
                    <p className="text-text-secondary">
                        Claims đang chờ phê duyệt của bạn
                    </p>
                </div>
                <div className="px-4 py-2 bg-orange-500/10 text-orange-400 rounded-xl font-bold">
                    {pendingClaims.length} claims chờ duyệt
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Left: Claims List */}
                <div className="col-span-1 space-y-3">
                    {pendingClaims.length === 0 ? (
                        <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 text-center">
                            <div className="text-4xl mb-3">✅</div>
                            <p className="text-text-secondary text-sm">Không có claims chờ duyệt</p>
                        </div>
                    ) : (
                        pendingClaims.map((claim) => (
                            <button
                                key={claim.id}
                                onClick={() => setSelectedClaim(claim)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedClaim?.id === claim.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border-dark bg-surface-dark hover:border-white/20'
                                    }`}
                            >
                                <div className="font-mono text-xs text-primary font-bold mb-1">
                                    {claim.claimNumber}
                                </div>
                                <div className="text-sm font-medium text-white mb-1">
                                    {claim.customerName}
                                </div>
                                <div className="text-xs text-text-secondary">
                                    {claim.amount.toLocaleString('vi-VN')}đ
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Right: Claim Detail & Approval */}
                <div className="col-span-2">
                    {!selectedClaim ? (
                        <div className="bg-surface-dark border border-border-dark rounded-2xl p-16 text-center">
                            <div className="text-6xl mb-4">👈</div>
                            <p className="text-text-secondary">Chọn claim để xem chi tiết</p>
                        </div>
                    ) : (
                        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 space-y-6">
                            {/* Claim Info */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Thông tin Claim</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-text-secondary mb-1">Mã claim</div>
                                        <div className="font-mono text-primary font-bold">{selectedClaim.claimNumber}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-text-secondary mb-1">Khách hàng</div>
                                        <div className="text-white font-medium">{selectedClaim.customerName}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-text-secondary mb-1">Loại</div>
                                        <div className="text-white capitalize">{selectedClaim.type}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-text-secondary mb-1">Số tiền</div>
                                        <div className="text-white font-bold">{selectedClaim.amount.toLocaleString('vi-VN')}đ</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-xs text-text-secondary mb-1">Mô tả</div>
                                        <div className="text-white text-sm">{selectedClaim.description}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Chain Timeline */}
                            {approvalChain && (
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">Quy trình phê duyệt</h3>
                                    <div className="space-y-3">
                                        {approvalChain.steps.map((step, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-xl border ${step.status === 'in_progress'
                                                        ? 'border-primary bg-primary/5'
                                                        : step.status === 'approved'
                                                            ? 'border-green-500/20 bg-green-500/5'
                                                            : 'border-border-dark bg-background-dark/50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-white">
                                                            Bước {step.stepNumber}: {step.stepName}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${step.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                                                step.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                                                                    'bg-gray-500/10 text-gray-400'
                                                            }`}>
                                                            {step.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                {step.approvals.map((approval, aIdx) => (
                                                    <div key={aIdx} className="text-xs text-text-secondary flex items-center gap-2 mt-1">
                                                        <span className="material-symbols-outlined text-xs">person</span>
                                                        <span>{approval.approverName}</span>
                                                        <span className={
                                                            approval.decision === 'approve' ? 'text-green-400' :
                                                                approval.decision === 'reject' ? 'text-red-400' : ''
                                                        }>
                                                            - {approval.decision}
                                                        </span>
                                                        {approval.comment && <span className="italic">"{approval.comment}"</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Comment Input */}
                            <div>
                                <label className="text-sm font-bold text-white mb-2 block">
                                    Nhận xét (tùy chọn)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Nhập nhận xét của bạn..."
                                    className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-muted focus:border-primary focus:outline-none resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border-dark">
                                <button
                                    onClick={() => handleApproval('approve')}
                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">check_circle</span>
                                    Phê duyệt
                                </button>
                                <button
                                    onClick={() => handleApproval('reject')}
                                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">cancel</span>
                                    Từ chối
                                </button>
                                <button
                                    onClick={() => handleApproval('request_info')}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
                                >
                                    Yêu cầu bổ sung
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovalInterface;
