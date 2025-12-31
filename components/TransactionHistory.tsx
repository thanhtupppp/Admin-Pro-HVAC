import React, { useState, useEffect } from 'react';
import { paymentService, Transaction } from '../services/paymentService';
import { userService } from '../services/userService';

const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filter, setFilter] = useState<'all' | Transaction['status']>('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTransactions();
    }, [filter]);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            if (filter === 'all') {
                const data = await paymentService.getTransactions();
                setTransactions(data);
            } else {
                const data = await paymentService.getTransactionsByStatus(filter);
                setTransactions(data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: Transaction['status'], tx: Transaction) => {
        try {
            // Update transaction status
            await paymentService.updateTransactionStatus(id, status);

            // If confirming (pending → completed), auto-activate plan
            if (status === 'completed' && tx.status === 'pending') {
                await paymentService.activatePlan(tx.userId, tx.planId);
                alert(`✅ Đã kích hoạt gói ${tx.planId} cho user ${tx.userId}`);
            }

            await loadTransactions();
        } catch (e) {
            console.error('Failed to update status:', e);
            alert('Lỗi khi cập nhật trạng thái. Vui lòng thử lại.');
        }
    };

    const getStatusBadge = (status: Transaction['status']) => {
        switch (status) {
            case 'completed':
                return <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold rounded-full">Hoàn thành</span>;
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold rounded-full">Chờ xác nhận</span>;
            case 'failed':
                return <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold rounded-full">Thất bại</span>;
        }
    };

    const getMethodBadge = (method: Transaction['paymentMethod']) => {
        switch (method) {
            case 'vietqr':
                return <span className="text-xs text-text-secondary flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">qr_code_2</span> VietQR</span>;
            case 'momo':
                return <span className="text-xs text-text-secondary flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">account_balance_wallet</span> Ví MoMo</span>;
            case 'banking':
                return <span className="text-xs text-text-secondary flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">account_balance</span> Chuyển khoản</span>;
            default:
                return <span className="text-xs text-text-secondary">{method}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white">Lịch sử thanh toán</h3>
                    <p className="text-xs text-text-secondary">Quản lý và xác nhận giao dịch từ khách hàng</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'completed', 'failed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as any)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === status
                                ? 'bg-primary text-white'
                                : 'bg-white/5 text-text-secondary hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {status === 'all' ? 'Tất cả' : status === 'pending' ? 'Chờ xác nhận' : status === 'completed' ? 'Hoàn thành' : 'Thất bại'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-surface-dark border border-border-dark/50 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                        <p className="text-sm text-text-secondary mt-2">Đang tải...</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-background-dark/50 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">User</th>
                                <th className="px-6 py-4 text-left">Gói</th>
                                <th className="px-6 py-4 text-left">Số tiền</th>
                                <th className="px-6 py-4 text-left">Phương thức</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-left">Ngày</th>
                                <th className="px-6 py-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark/20">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="material-symbols-outlined text-4xl text-text-secondary/30">receipt</span>
                                            <p className="text-sm text-text-secondary">
                                                {filter === 'all' ? 'Chưa có giao dịch nào' : `Không có giao dịch ${filter}`}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-white">{tx.userEmail || tx.userId}</p>
                                                <p className="text-[10px] text-text-secondary font-mono">{tx.id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-white font-medium">
                                                {tx.planName && tx.planName.trim() !== "" ? tx.planName : `Gói ${tx.planId.substring(0, 8)}...`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-primary">{tx.amount.toLocaleString()}₫</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getMethodBadge(tx.paymentMethod)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-text-secondary">
                                                <p>{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</p>
                                                <p>{new Date(tx.createdAt).toLocaleTimeString('vi-VN')}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {tx.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(tx.id, 'completed', tx)}
                                                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            Xác nhận
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(tx.id, 'failed', tx)}
                                                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                {tx.status !== 'pending' && (
                                                    <span className="text-xs text-text-secondary italic">-</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Stats */}
            {transactions.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-surface-dark border border-border-dark/50 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Tổng giao dịch</p>
                        <p className="text-2xl font-bold text-white mt-1">{transactions.length}</p>
                    </div>
                    <div className="bg-surface-dark border border-border-dark/50 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Chờ xác nhận</p>
                        <p className="text-2xl font-bold text-yellow-500 mt-1">
                            {transactions.filter(tx => tx.status === 'pending').length}
                        </p>
                    </div>
                    <div className="bg-surface-dark border border-border-dark/50 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Tổng doanh thu</p>
                        <p className="text-2xl font-bold text-green-500 mt-1">
                            {transactions.filter(tx => tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}₫
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
