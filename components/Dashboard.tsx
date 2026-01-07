import React, { useState, useEffect, useRef } from 'react';
import { dashboardService, DashboardStats } from '../services/dashboardService';
import { errorService } from '../services/errorService';
import { userService } from '../services/userService';
import { paymentService } from '../services/paymentService';
import { ErrorCode, AdminUser, Transaction } from '../types';
import StatCard from './StatCard';
import DashboardCharts from './DashboardCharts';
import { format } from 'date-fns';

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
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;

    setIsExporting(true);
    try {
      const filename = `dashboard-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      await dashboardService.exportToPDF(dashboardRef.current, filename);
      alert('✅ Đã xuất báo cáo thành công!');
    } catch (error) {
      alert('❌ Xuất báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  // Define stat cards with dynamic visibility
  const statCards = [
    {
      title: 'Người dùng',
      value: stats.totalUsers,
      trend: stats.trends.users,
      icon: 'group',
      iconColor: 'text-green-500',
      subtitle: 'tổng người dùng',
      isVisible: stats.totalUsers > 0
    },
    {
      title: 'Doanh thu',
      value: `${(stats.totalRevenue / 1000).toFixed(0)}K`,
      trend: stats.trends.revenue,
      icon: 'payments',
      iconColor: 'text-blue-500',
      subtitle: 'VNĐ tháng này',
      isVisible: stats.totalRevenue > 0
    },
    {
      title: 'Chờ duyệt',
      value: stats.pendingApprovals,
      trend: stats.trends.approvals,
      icon: 'pending_actions',
      iconColor: 'text-yellow-500',
      subtitle: 'thanh toán đang chờ',
      isVisible: stats.pendingApprovals > 0
    },
    {
      title: 'Mã lỗi',
      value: stats.activeErrors,
      trend: stats.trends.errors,
      icon: 'error',
      iconColor: 'text-red-500',
      subtitle: 'đang hoạt động',
      isVisible: true // Always show
    }
  ];

  return (
    <div ref={dashboardRef} className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-text-secondary text-sm flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Cập nhật realtime
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white font-bold rounded-xl border border-border-dark transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isExporting ? 'progress_activity' : 'download'}
          </span>
          {isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}
        </button>
      </div>

      {/* Dynamic Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // Skeleton loading
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 animate-pulse">
              <div className="h-16"></div>
            </div>
          ))
        ) : (
          statCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              trend={card.trend}
              icon={card.icon}
              iconColor={card.iconColor}
              subtitle={card.subtitle}
              isVisible={card.isVisible}
            />
          ))
        )}
      </div>

      {/* Analytics Charts */}
      <DashboardCharts transactions={allTransactions} users={allUsers} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Xu hướng nhập liệu</h3>
            <select className="bg-background-dark text-xs border-border-dark rounded-lg py-1.5 focus:ring-0">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {[40, 65, 35, 85, 50, 20, 10].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="w-full bg-primary/10 rounded-t-lg relative flex items-end overflow-hidden" style={{ height: '100%' }}>
                  <div className="w-full bg-primary/60 group-hover:bg-primary transition-all duration-500 rounded-t-lg shadow-lg shadow-primary/20" style={{ height: `${h}%` }}></div>
                </div>
                <span className="text-[10px] text-text-secondary font-bold">T{i + 2}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Mã lỗi mới nhất</h3>
            <button className="text-xs text-primary font-bold hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-text-secondary py-10">Đang tải dữ liệu...</div>
            ) : recentErrors.length === 0 ? (
              <div className="text-center text-text-secondary py-10">Chưa có mã lỗi nào</div>
            ) : (
              recentErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-border-dark/30 group">
                  <div className={`w-10 h-10 rounded-lg bg-blue-900/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/20`}>
                    {err.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{err.title}</p>
                    <p className="text-[10px] text-text-secondary font-medium">{err.brand} • Recent</p>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary text-sm opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
