import React, { useState, useEffect } from 'react';
import { systemService, AuditLogFilter } from '../services/systemService';
import { ActivityEntry } from '../types';
import { format } from 'date-fns';

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityEntry[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Date range filter
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // User filter
  const [selectedUser, setSelectedUser] = useState<string>('ALL');
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);

    // Setup real-time listener
    const filters: AuditLogFilter = {
      action: filter !== 'ALL' ? filter : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      userId: selectedUser !== 'ALL' ? selectedUser : undefined
    };

    const unsubscribe = systemService.getLogsRealtime((updatedLogs) => {
      setLogs(updatedLogs);
      setIsLoading(false);

      // Extract unique users for filter dropdown
      const users = Array.from(new Set(updatedLogs.map(log => log.userName)));
      setAvailableUsers(users);
    }, filters);

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [filter, startDate, endDate, selectedUser]);

  // Apply client-side user filter
  useEffect(() => {
    if (selectedUser === 'ALL') {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.userName === selectedUser));
    }
  }, [logs, selectedUser]);

  const handleExportCSV = () => {
    systemService.exportLogsToCSV(filteredLogs, `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'UPDATE': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'DELETE': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'SYSTEM': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'LOGIN': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-text-secondary bg-white/5 border-white/10';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return 'add_circle';
      case 'UPDATE': return 'edit_square';
      case 'DELETE': return 'delete_forever';
      case 'SYSTEM': return 'settings_suggest';
      case 'LOGIN': return 'login';
      default: return 'info';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-3 text-text-secondary">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span>Đang tải nhật ký...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nhật ký hoạt động</h1>
          <p className="text-text-secondary text-sm flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Cập nhật theo thời gian thực • {filteredLogs.length} bản ghi
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-border-dark transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Xuất CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface-dark border border-border-dark/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">filter_alt</span>
          Bộ lọc
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action Filter */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Hành động</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="ALL">Tất cả</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Người dùng</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="ALL">Tất cả</option>
              {availableUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white text-sm focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2 text-white text-sm focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(filter !== 'ALL' || selectedUser !== 'ALL' || startDate || endDate) && (
          <button
            onClick={() => {
              setFilter('ALL');
              setSelectedUser('ALL');
              setStartDate('');
              setEndDate('');
            }}
            className="text-primary text-sm hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Logs Timeline */}
      <div className="relative space-y-4 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-border-dark/30">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">inbox</span>
            <p>Không có bản ghi nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="relative pl-12 group">
              <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-background-dark flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${getActionColor(log.action)}`}>
                <span className="material-symbols-outlined text-[18px]">
                  {getActionIcon(log.action)}
                </span>
              </div>

              <div className="bg-surface-dark border border-border-dark/30 rounded-2xl p-5 hover:border-primary/20 transition-all shadow-xl shadow-black/5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{log.userName}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-text-secondary text-xs">đã tác động lên</span>
                    <span className="text-primary text-sm font-medium">{log.target}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-secondary bg-background-dark px-2 py-1 rounded-lg">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : 'N/A'}
                    </span>
                    {(log as any).ipAddress && (
                      <span className="text-[10px] font-mono text-text-secondary bg-background-dark px-2 py-1 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">public</span>
                        {(log as any).ipAddress}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed italic">
                  "{log.details}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
