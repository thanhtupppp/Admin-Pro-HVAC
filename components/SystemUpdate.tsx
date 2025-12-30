
import React, { useState, useEffect, useRef } from 'react';
import { SystemVersion } from '../types';

const SystemUpdate: React.FC = () => {
  const [currentVersion] = useState('3.2.0');
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState<SystemVersion | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'downloading' | 'applying' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const checkUpdates = () => {
    setIsChecking(true);
    addLog("Đang kết nối đến máy chủ cập nhật: https://api.service.vn/v1/update...");
    
    setTimeout(() => {
      const mockUpdate: SystemVersion = {
        version: '3.3.5-stable',
        releaseDate: '25/05/2024',
        type: 'stable',
        size: '42.8 MB',
        notes: [
          'Tối ưu hóa tốc độ nhận diện OCR thêm 40%.',
          'Sửa lỗi hiển thị danh sách Virtual Scroll trên thiết bị yếu.',
          'Nâng cấp bảo mật API Key cho Gemini 3.0.',
          'Thêm tính năng xem trước JSON cho Mobile App.'
        ]
      };
      setUpdateAvailable(mockUpdate);
      setIsChecking(false);
      addLog(`Tìm thấy phiên bản mới: ${mockUpdate.version}`);
    }, 2000);
  };

  const startUpdate = () => {
    setUpdateStatus('downloading');
    addLog("Bắt đầu tải bản cập nhật...");
    
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        applyUpdate();
      }
      setProgress(Math.floor(p));
      if (p > 30 && p < 35) addLog("Đang tải tệp: core_engine_v3.bin...");
      if (p > 70 && p < 75) addLog("Đang tải tệp: assets_ui_bundle.zip...");
    }, 400);
  };

  const applyUpdate = () => {
    setUpdateStatus('applying');
    addLog("Đang giải nén và ghi đè hệ thống...");
    
    setTimeout(() => {
      addLog("Đang kiểm tra tính toàn vẹn của mã nguồn...");
    }, 1000);

    setTimeout(() => {
      addLog("Cập nhật Database Schema thành công.");
    }, 2500);

    setTimeout(() => {
      setUpdateStatus('success');
      addLog("Hệ thống đã sẵn sàng. Phiên bản hiện tại: 3.3.5-stable");
    }, 4000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Version Status Card */}
      <div className="bg-surface-dark border border-border-dark/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <span className="material-symbols-outlined text-[150px]">system_update_alt</span>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="w-32 h-32 rounded-3xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-widest mb-1">Version</span>
              <span className="text-3xl font-bold">{currentVersion}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 animate-pulse"></div>
           </div>
           
           <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-2xl font-bold text-white">Trạng thái hệ thống</h2>
              <p className="text-text-secondary text-sm">Hệ thống của bạn đang chạy phiên bản ổn định nhất hiện tại.</p>
              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                 <button 
                  onClick={checkUpdates}
                  disabled={isChecking || updateStatus !== 'idle'}
                  className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-xl shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50"
                 >
                    {isChecking ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">search</span>}
                    {isChecking ? 'Đang kiểm tra...' : 'Kiểm tra cập nhật'}
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Update Available Info */}
      {updateAvailable && updateStatus === 'idle' && (
        <div className="bg-surface-dark border-2 border-primary/30 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
           <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Phiên bản mới {updateAvailable.version}</h3>
                <p className="text-xs text-text-secondary">Phát hành ngày: {updateAvailable.releaseDate} • Dung lượng: {updateAvailable.size}</p>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-full uppercase tracking-widest">Stable Release</span>
           </div>
           
           <div className="space-y-4 mb-8">
              <p className="text-xs font-bold text-white uppercase tracking-widest">Nhật ký thay đổi (What's New):</p>
              <ul className="space-y-2">
                {updateAvailable.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    {note}
                  </li>
                ))}
              </ul>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={startUpdate}
                className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
              >
                Cập nhật ngay bây giờ
              </button>
              <button className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl border border-border-dark hover:bg-white/10 transition-all">
                Để sau
              </button>
           </div>
        </div>
      )}

      {/* Update Progress & Terminal */}
      {updateStatus !== 'idle' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="bg-surface-dark border border-border-dark/30 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    {updateStatus === 'downloading' && 'Đang tải bản cập nhật...'}
                    {updateStatus === 'applying' && 'Đang áp dụng thay đổi...'}
                    {updateStatus === 'success' && 'Cập nhật thành công!'}
                  </h3>
                  <p className="text-xs text-text-secondary">Vui lòng không đóng trình duyệt trong quá trình này.</p>
                </div>
                <span className="text-2xl font-bold text-primary">{progress}%</span>
              </div>
              
              <div className="w-full h-3 bg-background-dark rounded-full overflow-hidden border border-border-dark/30 shadow-inner">
                 <div 
                  className="h-full bg-primary shadow-[0_0_15px_rgba(19,109,236,0.5)] transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                 ></div>
              </div>

              {updateStatus === 'success' && (
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">restart_alt</span>
                  Khởi động lại Admin Panel
                </button>
              )}
           </div>

           {/* Terminal Console */}
           <div className="bg-black/80 rounded-[2rem] border border-border-dark/50 p-6 font-mono text-[11px] leading-relaxed shadow-2xl h-64 flex flex-col">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-orange-500/50"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                 <span className="ml-2 text-text-secondary uppercase text-[9px] font-bold">System Log Terminal</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scroll space-y-1">
                 {logs.map((log, i) => (
                   <div key={i} className="text-blue-300/80">
                      <span className="text-green-500/60">admin@system:~$</span> {log}
                   </div>
                 ))}
                 <div ref={logEndRef}></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SystemUpdate;
