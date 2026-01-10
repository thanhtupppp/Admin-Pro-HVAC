import React, { useEffect, useState } from 'react';
import { securityService, ViolationLog } from '../services/securityService';

const ViolationLogPanel: React.FC = () => {
  const [logs, setLogs] = useState<ViolationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await securityService.getSuspiciousActivities();
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    // Handle Firestore Timestamp or Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  if (loading) return <div className="p-8 text-white">Đang tải dữ liệu...</div>;

  return (
    <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-red-500">🛡️</span> Nhật ký Vi phạm
        </h2>
        <button 
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          Làm mới
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#0f172a] text-gray-400 uppercase">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Thời gian</th>
              <th className="px-4 py-3">User Email</th>
              <th className="px-4 py-3">Loại vi phạm</th>
              <th className="px-4 py-3">Chi tiết</th>
              <th className="px-4 py-3 rounded-tr-lg">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {logs.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                   Chưa có ghi nhận vi phạm nào.
                 </td>
               </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {log.userEmail}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                     {log.type === 'auto_lock_screenshot' ? (
                        <span>Chụp màn hình <b>{log.count}</b> lần</span>
                     ) : (
                        log.reason || '-'
                     )}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                        onClick={() => securityService.unlockUser(log.userId).then(() => alert('Đã mở khóa user!'))}
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        Mở khóa User
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViolationLogPanel;
