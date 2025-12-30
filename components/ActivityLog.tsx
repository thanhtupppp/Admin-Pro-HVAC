
import React, { useState } from 'react';
import { MOCK_LOGS } from '../constants';

const ActivityLog: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  const filteredLogs = filter === 'ALL' 
    ? MOCK_LOGS 
    : MOCK_LOGS.filter(l => l.action === filter);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'UPDATE': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'DELETE': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'SYSTEM': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
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

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nhật ký hoạt động</h1>
          <p className="text-text-secondary text-sm">Theo dõi toàn bộ thay đổi hệ thống theo thời gian thực</p>
        </div>
        <div className="flex bg-surface-dark border border-border-dark p-1 rounded-xl">
          {['ALL', 'CREATE', 'UPDATE', 'DELETE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest ${
                filter === f ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'Tất cả' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative space-y-4 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-border-dark/30">
        {filteredLogs.map((log) => (
          <div key={log.id} className="relative pl-12 group">
            <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-background-dark flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${getActionColor(log.action)}`}>
              <span className="material-symbols-outlined text-[18px]">
                {getActionIcon(log.action)}
              </span>
            </div>
            
            <div className="bg-surface-dark border border-border-dark/30 rounded-2xl p-5 hover:border-primary/20 transition-all shadow-xl shadow-black/5">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{log.userName}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-text-secondary text-xs">đã tác động lên</span>
                  <span className="text-primary text-sm font-medium">{log.target}</span>
                </div>
                <span className="text-[10px] font-mono text-text-secondary bg-background-dark px-2 py-1 rounded-lg">
                  {log.timestamp}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                "{log.details}"
              </p>
            </div>
          </div>
        ))}

        <div className="text-center pt-8">
           <button className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-border-dark transition-all">
              Tải thêm dữ liệu lịch sử
           </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
