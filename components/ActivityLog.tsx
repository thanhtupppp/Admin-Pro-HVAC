import React, { useState, useEffect } from 'react';
import { systemService } from '../services/systemService';
import { ActivityEntry } from '../types';

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      // Use systemService's getLogsRealtime or just get from firebase directly
      const unsubscribe = systemService.getLogsRealtime((data) => {
        setLogs(data);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to load logs', error);
      setIsLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Nhật ký hoạt động</h1>
          <p className="text-sm text-text-muted">{logs.length} hoạt động gần đây</p>
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
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="font-mono text-text-muted text-sm">
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </td>
                <td className="font-medium text-text-primary">{log.userName}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${log.action === 'CREATE' ? 'bg-status-ok/10 text-status-ok' :
                      log.action === 'UPDATE' ? 'bg-brand-primary/10 text-brand-primary' :
                        log.action === 'DELETE' ? 'bg-status-error/10 text-status-error' :
                          'bg-text-muted/10 text-text-muted'
                    }`}>
                    {log.action}
                  </span>
                </td>
                <td className="text-text-secondary text-sm">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            Chưa có hoạt động nào
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
