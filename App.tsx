
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DocumentManager from './components/DocumentManager'; // New component
import ErrorEdit from './components/ErrorEdit';
import ErrorList from './components/ErrorList';
import SmartErrorImport from './components/SmartErrorImport';
import UserManager from './components/UserManager';
import PlanManager from './components/PlanManager';
import BrandManager from './components/BrandManager';
import ActivityLog from './components/ActivityLog';
import TransactionHistory from './components/TransactionHistory';
import Settings from './components/Settings';
import AISmartAssistant from './components/AISmartAssistant';
import Login from './components/Login';
import SystemUpdate from './components/SystemUpdate';
import { ViewType, ToastMessage } from './types';
import { NAV_ITEMS } from './constants';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Loading state
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Check auth state on mount và lắng nghe thay đổi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User đã đăng nhập, restore session
        setIsLoggedIn(true);
        // Load AI settings from Firebase
        const { loadAISettings } = await import('./components/AIService');
        await loadAISettings();
      } else {
        // User chưa đăng nhập
        setIsLoggedIn(false);
      }
      setIsCheckingAuth(false); // Đã check xong
    });

    // Cleanup listener khi unmount
    return () => unsubscribe();
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    setSelectedErrorId(null);
  };

  const handleEditError = (id: string) => {
    setSelectedErrorId(id);
    setCurrentView(ViewType.ERROR_EDIT);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    addToast("Đăng nhập thành công!", "success");
  };

  const handleLogout = async () => {
    await authService.signOut();
    setIsLoggedIn(false);
    setCurrentView(ViewType.DASHBOARD);
    addToast("Đã đăng xuất", "info");
  };

  // Hiển thị loading khi đang check auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 mx-auto animate-pulse">
            <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
          </div>
          <p className="text-text-secondary text-sm">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewType.DASHBOARD:
        return <Dashboard />;
      case ViewType.USER_MANAGER:
        return <UserManager />;
      case ViewType.PLAN_MANAGER:
        return <PlanManager />;
      case ViewType.ERROR_LIST:
        return <ErrorList onEdit={handleEditError} />;
      case ViewType.ERROR_EDIT:
        return (
          <ErrorEdit
            errorId={selectedErrorId || undefined}
            onCancel={() => setCurrentView(ViewType.ERROR_LIST)}
            onSave={() => {
              addToast("Đã lưu thay đổi", "success");
              setCurrentView(ViewType.ERROR_LIST);
            }}
          />
        );
      case ViewType.OCR_TOOL:
        return <SmartErrorImport />;
      case ViewType.DOCUMENT_MANAGER:
        return <DocumentManager />;
      case ViewType.BRAND_MANAGER:
        return <BrandManager />;
      case ViewType.ACTIVITY_LOG:
        return <ActivityLog />;
      case ViewType.SYSTEM_UPDATE:
        return <SystemUpdate />;
      case ViewType.TRANSACTIONS:
        return <TransactionHistory />;
      case ViewType.SETTINGS:
        return <Settings onSave={() => addToast("Cài đặt đã được cập nhật", "success")} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary space-y-4">
            <span className="material-symbols-outlined text-6xl">construction</span>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">Tính năng đang phát triển</h3>
              <p className="text-sm">Trang {NAV_ITEMS.find(n => n.id === currentView)?.label} đang được hoàn thiện.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate} onLogout={handleLogout}>
      {renderContent()}
      <AISmartAssistant />

      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-4 duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' :
                toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-primary text-white'
              }`}
          >
            <span className="material-symbols-outlined">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default App;
