
import React, { useState, useEffect } from 'react';
import { ViewType, Notification } from '../types';
import { NAV_ITEMS } from '../constants';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import { paymentService } from '../services/paymentService';
import NotificationPanel from './NotificationPanel';

const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

interface LayoutProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, onLogout, children }) => {
  const [currentUser, setCurrentUser] = useState<{ username: string, email: string, avatar: string } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingTxCount, setPendingTxCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Lấy thông tin user từ Firestore
        const users = await userService.getUsers();
        const userInDb = users.find(u => u.email === firebaseUser.email);
        if (userInDb) {
          setCurrentUser({
            username: userInDb.username,
            email: userInDb.email,
            avatar: userInDb.avatar || 'AD'
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe notifications real-time
  useEffect(() => {
    let lastCount = 0;
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;

    const unsubscribe = notificationService.subscribeNotifications((notifs) => {
      setNotifications(notifs);
      const newUnreadCount = notifs.filter(n => !n.read).length;
      
      // Play sound if unread count increased
      if (newUnreadCount > lastCount) {
        audio.play().catch(e => console.log('Autoplay blocked or audio failed:', e));
      }
      
      setUnreadCount(newUnreadCount);
      lastCount = newUnreadCount;
    }, 15);

    return () => unsubscribe();
  }, []);

  // Fetch pending transactions count
  useEffect(() => {
    const fetchPendingTx = async () => {
      try {
        const txs = await paymentService.getTransactionsByStatus('pending');
        setPendingTxCount(txs.length);
      } catch (e) {
        console.error('Error fetching pending tx count', e);
      }
    };
    fetchPendingTx();

    // Auto refresh every 30 seconds for pending tx
    const interval = setInterval(fetchPendingTx, 30000);
    return () => clearInterval(interval);
  }, [currentView]);

  const handleMarkAllRead = () => {
    // Mark all as read (update persistent storage)
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
        notificationService.markAsRead(unreadIds);
    }
    
    // Update state locally for immediate feedback
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

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
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all group ${currentView === item.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30 border border-primary/20'
                : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
                }`}
            >
              <span className={`material-symbols-outlined ${currentView === item.id ? 'text-white' : 'group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm flex-1">{item.label}</span>
              {item.id === ViewType.TRANSACTIONS && pendingTxCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {pendingTxCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border-dark/30">
          <div
            onClick={onLogout}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-red-500/10 cursor-pointer transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {currentUser?.avatar || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser?.username || 'Loading...'}</p>
              <p className="text-[10px] text-text-secondary truncate">{currentUser?.email || ''}</p>
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
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background-dark"></span>
                )}
              </button>
              {showNotifications && (
                <NotificationPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onClose={() => setShowNotifications(false)}
                  onMarkAllRead={handleMarkAllRead}
                />
              )}
            </div>
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
            <div className="relative">
              <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              {item.id === ViewType.TRANSACTIONS && pendingTxCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
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
