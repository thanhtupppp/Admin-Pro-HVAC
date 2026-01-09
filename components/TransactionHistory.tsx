import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { Transaction } from '../types';

const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMethod, setFilterMethod] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
        const matchesMethod = filterMethod === 'all' || tx.paymentMethod === filterMethod;
        const matchesSearch = 
            (tx.userId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.planName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.transferContent || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Date range filter
        let matchesDateRange = true;
        if (startDate || endDate) {
            const txDate = new Date(tx.createdAt);
            if (startDate) {
                matchesDateRange = matchesDateRange && txDate >= new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchesDateRange = matchesDateRange && txDate <= end;
            }
        }

        return matchesStatus && matchesMethod && matchesSearch && matchesDateRange;
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

    const handleClearFilters = () => {
        setFilterStatus('all');
        setFilterMethod('all');
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
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
                    <p className="text-sm text-text-muted">{filteredTransactions.length}/{transactions.length} giao dịch</p>
                </div>
                <button
                    onClick={async () => {
                        if (confirm('⚠️ CẢNH BÁO: Hành động này sẽ XÓA TOÀN BỘ giao dịch và Reset tất cả user về gói Free.\n\nBạn có chắc chắn không?')) {
                            await paymentService.resetSystemData();
                            alert('Đã reset dữ liệu thành công! Vui lòng tải lại trang.');
                            loadTransactions();
                        }
                    }}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">restart_alt</span>
                    Reset Dữ liệu (Test)
                </button>
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
            <div className="space-y-4">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Tìm người dùng, nội dung CK..."
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
                    <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                        className="bg-bg-soft border border-border-base rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    >
                        <option value="all">Tất cả phương thức</option>
                        <option value="vietqr">VietQR</option>
                        <option value="bank_transfer">Chuyển khoản</option>
                        <option value="momo">MoMo</option>
                        <option value="card">Thẻ</option>
                    </select>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-text-secondary">Từ ngày:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-bg-soft border border-border-base rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-text-secondary">Đến ngày:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-bg-soft border border-border-base rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                        />
                    </div>
                    {(startDate || endDate || filterStatus !== 'all' || filterMethod !== 'all' || searchTerm) && (
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 bg-bg-soft hover:bg-border-base text-text-primary rounded-lg text-sm transition-all"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="industrial-card">
                <table className="industrial-table">
                    <thead>
                        <tr>
                            <th>Thời gian</th>
                            <th>Người dùng</th>
                            <th>Gói dịch vụ</th>
                            <th>Phương thức / Nội dung</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                            <th className="text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((tx) => (
                            <tr key={tx.id}>
                                <td className="font-mono text-text-muted text-sm whitespace-nowrap">
                                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                                </td>
                                <td className="text-text-primary">
                                    <div className="font-semibold">{tx.userName || tx.userId.substring(0, 8) + '...'}</div>
                                    <div className="text-xs text-text-muted">{tx.userEmail}</div>
                                    {tx.userPhone && (
                                        <div className="text-xs text-brand-secondary">{tx.userPhone}</div>
                                    )}
                                </td>
                                <td className="text-text-secondary">{tx.planName || '—'}</td>
                                <td>
                                    <div className="flex flex-col gap-1">
                                        <span className="w-fit px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded capitalize">
                                            {tx.paymentMethod === 'vietqr' ? 'VietQR' :
                                                tx.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' :
                                                    tx.paymentMethod === 'momo' ? 'MoMo' :
                                                        tx.paymentMethod === 'card' ? 'Thẻ' :
                                                            tx.paymentMethod || '—'}
                                        </span>
                                        {tx.transferContent && (
                                            <div className="text-xs font-mono text-text-muted bg-white/5 p-1 rounded">
                                                {tx.transferContent}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="font-mono text-brand-primary font-medium whitespace-nowrap">
                                    {tx.amount.toLocaleString('vi-VN')} VNĐ
                                </td>
                                <td>
                                    <span className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${tx.status === 'completed' ? 'status-ok' :
                                            tx.status === 'pending' ? 'status-warn' :
                                                'status-error'
                                        }`}>
                                        <span className="material-symbols-outlined text-[14px]">
                                            {tx.status === 'completed' ? 'check_circle' :
                                                tx.status === 'pending' ? 'schedule' :
                                                    'cancel'}
                                        </span>
                                        {tx.status === 'completed' ? 'Thành công' :
                                            tx.status === 'pending' ? 'Chờ duyệt' :
                                                'Thất bại'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    {tx.status === 'pending' && (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleApprove(tx.id)}
                                                className="px-3 py-1 bg-status-ok/10 hover:bg-status-ok text-status-ok hover:text-white transition-all rounded text-xs font-medium"
                                                title="Duyệt"
                                            >
                                                Duyệt
                                            </button>
                                            <button
                                                onClick={() => handleReject(tx.id)}
                                                className="px-3 py-1 bg-status-error/10 hover:bg-status-error text-status-error hover:text-white transition-all rounded text-xs font-medium"
                                                title="Từ chối"
                                            >
                                                Từ chối
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
                        {searchTerm || filterStatus !== 'all' || filterMethod !== 'all' || startDate || endDate
                            ? 'Không tìm thấy giao dịch phù hợp'
                            : 'Chưa có giao dịch nào'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
