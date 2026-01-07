import React, { useState, useEffect } from 'react';
import { dashboardService, DashboardStats } from '../services/dashboardService';
import { errorService } from '../services/errorService';
import { userService } from '../services/userService';
import { paymentService } from '../services/paymentService';
import { ErrorCode, AdminUser, Transaction } from '../types';
import IndustrialStatusCard from './IndustrialStatusCard';
import DashboardCharts from './DashboardCharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeErrors: 0,
    trends: { users: 12.5, revenue: 8.3, approvals: -5.2, errors: 15.7 }
  });
  const [recentErrors, setRecentErrors] = useState<ErrorCode[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time stats subscription
  useEffect(() => {
    const unsubscribe = dashboardService.getStatsRealtime((updatedStats) => {
      setStats(updatedStats);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load additional data for charts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [errors, users, transactions] = await Promise.all([
          errorService.getErrors(),
          userService.getUsers(),
          paymentService.getTransactions()
        ]);

        setRecentErrors(errors.slice(0, 5));
        setAllUsers(users);
        setAllTransactions(transactions);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-pulse-slow text-brand-primary text-4xl mb-4">●</div>
          <p className="text-text-secondary text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header - Corporate Minimalism */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Tổng quan hệ thống</h1>
          <p className="text-sm text-text-muted">Admin Pro HVAC Management Dashboard</p>
        </div>
        <div className="text-xs text-text-muted font-mono">
          Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </div>

      {/* Stats Grid - Clean 4-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <IndustrialStatusCard
          label="Người dùng"
          value={stats.totalUsers}
          status={stats.totalUsers > 100 ? 'ok' : stats.totalUsers > 50 ? 'warn' : 'off'}
          subtitle={`${stats.trends.users > 0 ? '+' : ''}${stats.trends.users.toFixed(1)}% so với tháng trước`}
        />

        <IndustrialStatusCard
          label="Doanh thu"
          value={(stats.totalRevenue / 1000000).toFixed(1)}
          unit="M VNĐ"
          status={stats.totalRevenue > 0 ? 'ok' : 'off'}
          subtitle={`${stats.trends.revenue > 0 ? '+' : ''}${stats.trends.revenue.toFixed(1)}% tăng trưởng`}
        />

        <IndustrialStatusCard
          label="Chờ duyệt"
          value={stats.pendingApprovals}
          status={stats.pendingApprovals > 5 ? 'warn' : stats.pendingApprovals > 0 ? 'ok' : 'off'}
          subtitle="thanh toán đang chờ"
        />

        <IndustrialStatusCard
          label="Lỗi đang xử lý"
          value={stats.activeErrors}
          status={stats.activeErrors > 20 ? 'error' : stats.activeErrors > 10 ? 'warn' : 'ok'}
          subtitle={`${stats.trends.errors > 0 ? '+' : ''}${stats.trends.errors.toFixed(1)}% so với trước`}
        />
      </div>

      {/* Charts Section - Corporate Clean */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-text-primary">Phân tích dữ liệu</h2>
        <DashboardCharts transactions={allTransactions} users={allUsers} />
      </div>

      {/* Recent Errors - Clean Table */}
      {recentErrors.length > 0 && (
        <div className="industrial-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Lỗi gần đây</h2>
            <button className="text-sm text-brand-primary hover:text-brand-accent transition-colors">
              Xem tất cả →
            </button>
          </div>

          <table className="industrial-table">
            <thead>
              <tr>
                <th>Mã lỗi</th>
                <th>Mô tả</th>
                <th>Hãng</th>
                <th>Lượt xem</th>
              </tr>
            </thead>
            <tbody>
              {recentErrors.map(error => (
                <tr key={error.id}>
                  <td className="font-mono text-brand-primary">{error.code}</td>
                  <td className="text-text-primary">{error.description}</td>
                  <td className="text-text-secondary">{error.brandName}</td>
                  <td className="font-mono text-text-muted">{error.views || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
