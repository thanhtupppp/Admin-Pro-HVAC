import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { Transaction } from '../types';

const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setIsLoading(true);
        try {
            const data = await paymentService.getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error('Failed to load transactions', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
        const matchesSearch = tx.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.planName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleApprove = async (id: string) => {
        if (confirm('Xác nhận duyệt thanh toán?')) {
            try {
                await paymentService.updateTransactionStatus(id, 'completed');
                loadTransactions();
            } catch (error) {
                console.error('Failed to approve transaction', error);
            }
        }
    };

    const handleReject = async (id: string) => {
        if (confirm('Xác nhận từ chối thanh toán?')) {
            try {
                await paymentService.updateTransactionStatus(id, 'failed');
                loadTransactions();
            } catch (error) {
                console.error('Failed to reject transaction', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-pulse-slow text-brand-primary text-4xl mb-4">●</div>
                    <p className="text-text-secondary text-sm">Đang tải giao dịch...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary mb-1">Quản lý Thanh toán</h1>
                    <p className="text-sm text-text-muted">{transactions.length} giao dịch</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Tổng giao dịch', value: transactions.length, status: 'all' },
                    { label: 'Chờ duyệt', value: transactions.filter(t => t.status === 'pending').length, status: 'pending' },
                    { label: 'Thành công', value: transactions.filter(t => t.status === 'completed').length, status: 'completed' },
                    { label: 'Thất bại', value: transactions.filter(t => t.status === 'failed').length, status: 'failed' },
                ].map((stat, i) => (
                    <div key={i} className="industrial-card">
                        <div className="text-xs text-text-muted mb-1">{stat.label}</div>
                        <div className="text-2xl font-mono font-semibold text-text-primary">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm giao dịch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="completed">Thành công</option>
                    <option value="failed">Thất bại</option>
                </select>
            </div>

            {/* Transactions Table */}
            <div className="industrial-card">
                <table className="industrial-table">
                    <thead>
                        <tr>
                            <th>Thời gian</th>
                            <th>Người dùng</th>
                            <th>Gói dịch vụ</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                            <th className="text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((tx) => (
                            <tr key={tx.id}>
                                <td className="font-mono text-text-muted text-sm">
                                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                                </td>
                                <td className="font-medium text-text-primary">{tx.userId}</td>
                                <td className="text-text-secondary">{tx.planName || '—'}</td>
                                <td className="font-mono text-brand-primary font-medium">
                                    {tx.amount.toLocaleString('vi-VN')} VNĐ
                                </td>
                                <td>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${tx.status === 'completed' ? 'status-ok' :
                                        tx.status === 'pending' ? 'status-warn' :
                                            'status-error'
                                        }`}>
                                        {tx.status === 'completed' ? '● Thành công' :
                                            tx.status === 'pending' ? '⚠ Chờ duyệt' :
                                                '✕ Thất bại'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    {tx.status === 'pending' && (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleApprove(tx.id)}
                                                className="text-text-secondary hover:text-status-ok transition-colors"
                                                title="Duyệt"
                                            >
                                                <span className="material-symbols-outlined text-xl">check_circle</span>
                                            </button>
                                            <button
                                                onClick={() => handleReject(tx.id)}
                                                className="text-text-secondary hover:text-status-error transition-colors"
                                                title="Từ chối"
                                            >
                                                <span className="material-symbols-outlined text-xl">cancel</span>
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredTransactions.length === 0 && (
                    <div className="text-center py-12 text-text-muted">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Không tìm thấy giao dịch phù hợp'
                            : 'Chưa có giao dịch nào'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
