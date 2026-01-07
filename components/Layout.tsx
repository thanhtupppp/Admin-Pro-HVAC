
import React, { useState, useEffect } from 'react';
import { ViewType, Notification } from '../types';
import { NAV_ITEMS } from '../constants';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import { paymentService } from '../services/paymentService';
import NotificationPanel from './NotificationPanel';
import Sidebar from './Sidebar';

const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

interface LayoutProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, onLogout, children }) => {
  const [currentUser, setCurrentUser] = useState<{ name: string, role: string, email: string } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingTxCount, setPendingTxCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const users = await userService.getUsers();
        const userInDb = users.find(u => u.email === firebaseUser.email);
        if (userInDb) {
          setCurrentUser({
            name: userInDb.username,
            email: userInDb.email,
            role: userInDb.role || 'User'
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

    const interval = setInterval(fetchPendingTx, 30000);
    return () => clearInterval(interval);
  }, [currentView]);

  const handleMarkAllRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      notificationService.markAsRead(unreadIds);
    }

    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="flex h-screen w-full bg-bg-base overflow-hidden">
      {/* Industrial Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar
          currentView={currentView}
          onNavigate={onNavigate}
          currentUser={currentUser}
        />
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border-base bg-bg-panel/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-text-secondary hover:text-text-primary">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-lg font-semibold text-text-primary">
              {NAV_ITEMS.find(n => n.id === currentView)?.label || 'Chi tiết'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-bg-soft border border-border-base rounded-xl px-3 py-2 w-64 focus-within:ring-1 ring-brand-primary/50 transition-all">
              <span className="material-symbols-outlined text-text-muted text-sm">search</span>
              <input
                type="text"
                placeholder="Tìm nhanh..."
                className="bg-transparent border-none text-xs text-text-primary focus:ring-0 w-full placeholder:text-text-muted"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-status-error rounded-full border border-bg-panel"></span>
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
