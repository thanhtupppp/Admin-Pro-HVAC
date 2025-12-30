import React, { useState, useEffect } from 'react';
import { errorService } from '../services/errorService';
import { brandService } from '../services/brandService';
import { userService } from '../services/userService';
import { ErrorCode } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    errors: 0,
    brands: 0,
    users: 0,
    pending: 0
  });
  const [recentErrors, setRecentErrors] = useState<ErrorCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [errors, brands, users] = await Promise.all([
          errorService.getErrors(),
          brandService.getBrands(),
          userService.getUsers()
        ]);

        setStats({
          errors: errors.length,
          brands: brands.length,
          users: users.length,
          pending: errors.filter(e => e.status === 'pending').length
        });

        // Take last 5 errors (or top 5 depending on sorting, assuming current order is relevant)
        setRecentErrors(errors.slice(0, 5));
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng mã lỗi', value: isLoading ? '...' : stats.errors, change: '+12%', color: 'blue', icon: 'error' },
          { label: 'Chờ duyệt', value: isLoading ? '...' : stats.pending, change: 'Cao', color: 'orange', icon: 'pending_actions' },
          { label: 'Hãng sản xuất', value: isLoading ? '...' : stats.brands, change: '+2 mới', color: 'purple', icon: 'business' },
          { label: 'Quản trị viên', value: isLoading ? '...' : stats.users, change: 'Online', color: 'green', icon: 'group' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-dark border border-border-dark/50 rounded-2xl p-5 hover:border-primary/50 transition-colors cursor-default group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-${stat.color}-500/10 rounded-lg text-${stat.color}-500 group-hover:bg-${stat.color}-500 group-hover:text-white transition-colors`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.color === 'orange' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-text-secondary text-xs font-medium uppercase tracking-wider">{stat.label}</h3>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

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
            ) : recentErrors.map((err, i) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
