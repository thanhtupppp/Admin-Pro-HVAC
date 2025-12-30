import React from 'react';
import { Notification } from '../types';

interface NotificationPanelProps {
    notifications: Notification[];
    unreadCount: number;
    onClose: () => void;
    onMarkAllRead: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
    notifications,
    unreadCount,
    onClose,
    onMarkAllRead
}) => {
    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'user':
                return 'person';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'system':
            default:
                return 'settings';
        }
    };

    const getNotificationColor = (type: Notification['type']) => {
        switch (type) {
            case 'user':
                return 'text-blue-400';
            case 'error':
                return 'text-green-400';
            case 'warning':
                return 'text-orange-400';
            case 'system':
            default:
                return 'text-gray-400';
        }
    };

    return (
        <div
            className="absolute right-0 top-14 w-96 backdrop-blur-xl border border-border-dark rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50"
            style={{ backgroundColor: 'rgb(28, 32, 39)' }}
        >
            {/* Header */}
            <div
                className="p-4 border-b border-border-dark/30 flex items-center justify-between backdrop-blur-md"
                style={{ backgroundColor: 'rgb(16, 24, 34)' }}
            >
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">notifications</span>
                    <h3 className="font-bold text-white">Thông báo</h3>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllRead}
                            className="text-[10px] text-primary font-bold hover:underline"
                        >
                            Đánh dấu đã đọc
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1 text-text-secondary hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto custom-scroll">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-text-secondary">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-30">notifications_off</span>
                        <p className="text-sm">Không có thông báo mới</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border-dark/20">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 hover:bg-white/[0.02] transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg bg-white/5 ${getNotificationColor(notif.type)}`}>
                                        <span className="material-symbols-outlined text-[20px]">
                                            {notif.icon || getNotificationIcon(notif.type)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`text-sm font-bold ${!notif.read ? 'text-white' : 'text-gray-400'}`}>
                                                {notif.title}
                                            </h4>
                                            {!notif.read && (
                                                <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5"></span>
                                            )}
                                        </div>
                                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-text-secondary/60 mt-1">
                                            {notif.timestamp}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-border-dark/30 bg-background-dark/30 text-center">
                    <button className="text-xs font-bold text-primary hover:underline">
                        Xem tất cả hoạt động
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
