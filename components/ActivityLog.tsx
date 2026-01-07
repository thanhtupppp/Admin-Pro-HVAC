import React, { useState, useEffect } from 'react';
import { systemService, AuditLogFilter } from '../services/systemService';
import { ActivityEntry } from '../types';

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<AuditLogFilter>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');

  // Get unique users and actions for filter dropdowns
  const uniqueUsers = Array.from(new Set(logs.map(log => log.userName).filter(Boolean)));
  const uniqueActions = Array.from(new Set(logs.map(log => log.action).filter(Boolean)));

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const unsubscribe = systemService.getLogsRealtime((data) => {
        setLogs(data);
        setIsLoading(false);
      }, filters);
      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to load logs', error);
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const newFilters: AuditLogFilter = {};

    if (startDate) {
      newFilters.startDate = new Date(startDate);
    }
    if (endDate) {
      newFilters.endDate = new Date(endDate);
    }
    if (selectedUser !== 'ALL') {
      newFilters.userId = selectedUser;
    }
    if (selectedAction !== 'ALL') {
      newFilters.action = selectedAction;
    }

    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedUser('ALL');
    setSelectedAction('ALL');
    setFilters({});
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      systemService.exportLogsToCSV(logs, `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      alert(`✅ Đã xuất ${logs.length} bản ghi thành công!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ Xuất file thất bại!');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-pulse-slow text-brand-primary text-4xl mb-4">●</div>
          <p className="text-text-secondary text-sm">Đang tải nhật ký...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Nhật ký hoạt động</h1>
          <p className="text-sm text-text-muted">{logs.length} hoạt động gần đây</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={isExporting || logs.length === 0}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isExporting ? 'progress_activity' : 'download'}
          </span>
          {isExporting ? 'Đang xuất...' : 'Xuất CSV'}
        </button>
      </div>

      {/* Filter Panel */}
      <div className="industrial-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-brand-primary">filter_list</span>
          <h3 className="text-sm font-bold text-text-primary">Bộ lọc</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-bg-soft border border-border-base rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-bg-soft border border-border-base rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* User Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Người dùng</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-bg-soft border border-border-base rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            >
              <option value="ALL">Tất cả</option>
              {uniqueUsers.map((user, i) => (
                <option key={i} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Hành động</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full bg-bg-soft border border-border-base rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            >
              <option value="ALL">Tất cả</option>
              {uniqueActions.map((action, i) => (
                <option key={i} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold rounded-lg text-sm transition-all"
          >
            Áp dụng
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-bg-soft hover:bg-border-base text-text-primary font-bold rounded-lg text-sm transition-all"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="industrial-card">
        <table className="industrial-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người dùng</th>
              <th>Hành động</th>
              <th>Mục tiêu</th>
              <th>Chi tiết</th>
              <th>IP Address</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="font-mono text-text-muted text-sm whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </td>
                <td className="font-medium text-text-primary">{log.userName}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${log.action === 'CREATE' ? 'bg-status-ok/10 text-status-ok' :
                      log.action === 'UPDATE' ? 'bg-brand-primary/10 text-brand-primary' :
                        log.action === 'DELETE' ? 'bg-status-error/10 text-status-error' :
                          log.action === 'LOGIN' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-text-muted/10 text-text-muted'
                    }`}>
                    {log.action}
                  </span>
                </td>
                <td className="text-text-secondary text-sm">{log.target || 'N/A'}</td>
                <td className="text-text-secondary text-sm max-w-xs truncate">{log.details}</td>
                <td className="font-mono text-text-muted text-xs">{(log as any).ipAddress || 'Unknown'}</td>
                <td>
                  {(log as any).success !== undefined && (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${(log as any).success ? 'bg-status-ok/10 text-status-ok' : 'bg-status-error/10 text-status-error'
                      }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {(log as any).success ? 'check_circle' : 'error'}
                      </span>
                      {(log as any).success ? 'Thành công' : 'Thất bại'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && !isLoading && (
          <div className="text-center py-12 text-text-muted">
            {Object.keys(filters).length > 0 ? 'Không tìm thấy hoạt động phù hợp' : 'Chưa có hoạt động nào'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
