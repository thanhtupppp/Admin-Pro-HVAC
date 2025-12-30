
import React from 'react';
import { ViewType } from '../types';
import { NAV_ITEMS } from '../constants';

interface LayoutProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, onLogout, children }) => {
  return (
    <div className="flex h-screen w-full bg-background-dark overflow-hidden font-display">
      {/* Sidebar - Hidden on mobile, shown on md+ */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-dark border-r border-border-dark/30 h-full shrink-0">
        <div className="flex items-center gap-3 p-6 border-b border-border-dark/30">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin Pro</h1>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest">Service Console</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scroll">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all group ${
                currentView === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 border border-primary/20' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined ${currentView === item.id ? 'text-white' : 'group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border-dark/30">
          <div 
            onClick={onLogout}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-red-500/10 cursor-pointer transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-[10px] text-text-secondary truncate">admin@system.vn</p>
            </div>
            <span className="material-symbols-outlined text-text-secondary group-hover:text-red-500 text-lg transition-colors">logout</span>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border-dark/30 bg-background-dark/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-text-secondary hover:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-lg font-bold text-white">
              {NAV_ITEMS.find(n => n.id === currentView)?.label || 'Chi tiết'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-surface-dark border border-border-dark rounded-xl px-3 py-2 w-64 focus-within:ring-1 ring-primary/50 transition-all">
              <span className="material-symbols-outlined text-text-secondary text-sm">search</span>
              <input 
                type="text" 
                placeholder="Tìm nhanh..." 
                className="bg-transparent border-none text-xs text-white focus:ring-0 w-full placeholder:text-text-secondary"
              />
            </div>
            <button className="relative p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background-dark"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scroll relative">
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-dark/95 backdrop-blur-md border-t border-border-dark/30 px-4 py-2 flex justify-around shadow-2xl">
        {NAV_ITEMS.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === item.id ? 'text-primary' : 'text-text-secondary'}`}
          >
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button 
          onClick={onLogout}
          className="flex flex-col items-center gap-1 p-2 text-text-secondary"
        >
          <span className="material-symbols-outlined text-2xl text-red-400">logout</span>
          <span className="text-[10px] font-medium">Thoát</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
