
import React, { useState } from 'react';
import { authService } from '../services/authService';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const result = await authService.signIn(email, password);

    if (result.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(result.error || 'Đăng nhập thất bại');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 font-display">
      <div className="w-full max-w-md bg-surface-dark border border-border-dark/30 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Decor */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center space-y-8">
          <div className="space-y-3">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 mx-auto mb-6">
              <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Pro</h1>
            <p className="text-text-secondary text-sm">Chào mừng quay trở lại, hãy đăng nhập để tiếp tục quản trị hệ thống.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Email quản trị</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">alternate_email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@service.vn"
                  className="w-full bg-background-dark border border-border-dark rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-secondary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background-dark border border-border-dark rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-secondary/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 bg-background-dark border-border-dark rounded text-primary focus:ring-primary focus:ring-offset-background-dark" />
                <span className="text-xs text-text-secondary group-hover:text-white transition-colors">Ghi nhớ</span>
              </label>
              <a href="#" className="text-xs text-primary font-bold hover:underline">Quên mật khẩu?</a>
            </div>

            <button
              disabled={isLoading}
              className={`w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  Đăng nhập ngay
                </>
              )}
            </button>

            {errorMessage && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
              </div>
            )}
          </form>

          <div className="pt-4 border-t border-border-dark/20">
            <p className="text-[10px] text-text-secondary font-medium">Hệ thống quản lý nội bộ dành cho Technician App</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
