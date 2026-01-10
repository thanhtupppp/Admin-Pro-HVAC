import React, { useState, useEffect } from 'react';
import { securityService, ViolationLog } from '../services/securityService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const SecurityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ViolationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [filterType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const fetchedLogs = await securityService.getSuspiciousActivities();
      // Client-side filter if needed (or update service to accept filter)
      let filtered = fetchedLogs;
      if (filterType !== 'all') {
         filtered = fetchedLogs.filter(log => log.type === filterType);
      }
      setLogs(filtered);
    } catch (error) {
      console.error("Error fetching security logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (count: number) => {
    if (count >= 5) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (count >= 3) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'screenshot_excess': return 'Chụp màn hình quá mức';
      case 'auto_lock_screenshot': return 'Auto-Lock (Screenshot)';
      default: return type;
    }
  };

  const handleUnlock = async (log: ViolationLog) => {
      if(confirm(`Mở khóa cho user ${log.userEmail}?`)) {
          try {
             // 1. Unlock User
             await securityService.unlockUser(log.userId);
             
             // 2. Mark this log as resolved
             await securityService.resolveSuspiciousActivity(log.id);
             
             alert('Đã mở khóa và cập nhật trạng thái thành công');
             fetchLogs(); // Refresh list
          } catch (e) {
             alert('Có lỗi xảy ra: ' + e);
          }
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Nhật ký Vi phạm</h2>
          <p className="text-text-secondary mt-1">Theo dõi các hành vi đáng ngờ và vi phạm chính sách</p>
        </div>
        
        <div className="flex gap-2">
           <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-bg-panel border border-border-base rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-brand-primary outline-none"
          >
            <option value="all">Tất cả loại vi phạm</option>
            <option value="screenshot_excess">Chụp màn hình</option>
            <option value="auto_lock_screenshot">Auto-Lock</option>
          </select>
          <button 
            onClick={fetchLogs}
            className="px-4 py-2 bg-bg-panel border border-border-base rounded-lg text-text-primary hover:bg-bg-hover transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
            Làm mới
          </button>
        </div>
      </div>

      <div className="bg-bg-panel rounded-2xl border border-border-base overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-subtle border-b border-border-base">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Người dùng</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Loại vi phạm</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Số lần / Chi tiết</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Nền tảng</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {loading ? (
                 [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-bg-subtle rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-bg-subtle rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-bg-subtle rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-bg-subtle rounded w-16"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-bg-subtle rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    <span className="material-symbols-outlined text-4xl mb-2">security</span>
                    <p>Chưa có dữ liệu vi phạm nào được ghi nhận</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-hover/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {/* Handle Firestore Timestamp key */}
                      {log.timestamp && typeof log.timestamp.toDate === 'function' 
                         ? format(log.timestamp.toDate(), 'dd/MM/yyyy HH:mm:ss', { locale: vi })
                         : log.timestamp ? format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: vi }) : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-primary">{log.userEmail}</span>
                        <span className="text-xs text-text-muted font-mono">{log.userId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(log.count)}`}>
                        {getTypeLabel(log.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary font-medium">
                      {log.count} lần
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary capitalize">
                      {log.platform || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {log.resolved ? (
                           <div className="flex flex-col items-end">
                               <span className="inline-flex items-center gap-1 text-green-500 font-medium text-sm">
                                   <span className="material-symbols-outlined text-sm">check_circle</span>
                                   Đã mở khóa
                               </span>
                               {log.resolvedAt && (
                                   <span className="text-xs text-text-muted">
                                       {/* Check if resolvedAt is Timestamp or Date */}
                                       {log.resolvedAt.toDate 
                                          ? format(log.resolvedAt.toDate(), 'HH:mm dd/MM', { locale: vi })
                                          : format(new Date(log.resolvedAt), 'HH:mm dd/MM', { locale: vi })
                                       }
                                   </span>
                               )}
                           </div>
                       ) : (
                           <button 
                              onClick={() => handleUnlock(log)}
                              className="px-3 py-1 bg-brand-primary hover:bg-brand-primary/90 text-white rounded shadow-sm text-sm font-medium transition-all"
                           >
                              Mở khóa
                           </button>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
