import { Notification, ActivityEntry } from '../types';
import { collection, query, orderBy, limit, getDocs, onSnapshot, where } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const notificationService = {
    /**
     * Helper: Get read IDs from LocalStorage
     */
    getReadIds: (): string[] => {
        try {
            const stored = localStorage.getItem('admin_read_notifications');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Helper: Mark IDs as read
     */
    markAsRead: (ids: string[]) => {
        const current = notificationService.getReadIds();
        const newIds = [...new Set([...current, ...ids])];
        localStorage.setItem('admin_read_notifications', JSON.stringify(newIds));
    },

    /**
     * Convert ActivityEntry thành Notification
     */
    activityToNotification: (activity: ActivityEntry, readIds: string[] = []): Notification => {
        let type: Notification['type'] = 'system';
        let icon = 'info';
        let title = '';
        let message = activity.details;

        // Xác định type và icon dựa trên action
        if (activity.target.includes('User') || activity.target.includes('user')) {
            type = 'user';
            icon = 'person';
            if (activity.action === 'CREATE') {
                title = 'User mới';
                message = `${activity.userName} đã tạo user mới: ${activity.details}`;
            } else if (activity.action === 'UPDATE') {
                title = 'Cập nhật user';
                message = activity.details;
            } else if (activity.action === 'DELETE') {
                title = 'Xóa user';
                message = `${activity.userName} đã xóa user: ${activity.details}`;
            }
        } else if (activity.target.includes('Error') || activity.target.includes('error')) {
            type = 'error';
            icon = 'error';
            if (activity.action === 'CREATE') {
                title = 'Mã lỗi mới';
                message = `${activity.userName} đã thêm mã lỗi: ${activity.details}`;
            } else {
                title = 'Cập nhật mã lỗi';
                message = activity.details;
            }
        } else if (activity.severity === 'warning' || activity.severity === 'danger') {
            type = 'warning';
            icon = 'warning';
            title = 'Cảnh báo hệ thống';
        } else {
            type = 'system';
            icon = 'settings';
            title = 'Hoạt động hệ thống';
        }

        return {
            id: activity.id,
            type,
            title,
            message,
            timestamp: activity.timestamp,
            read: readIds.includes(activity.id),
            icon,
            activityId: activity.id
        };
    },

    /**
     * Convert Transaction thành Notification
     */
    transactionToNotification: (tx: any): Notification => {
        return {
            id: tx.id,
            type: 'warning', // Warning for pending money
            title: 'Thanh toán mới',
            message: `User ${tx.userEmail || tx.userId} vừa báo đã chuyển khoản gói ${tx.planName || tx.planId}. Số tiền: ${tx.amount.toLocaleString()}₫`,
            timestamp: tx.createdAt,
            // With transactions, if status is NOT pending, it is effectively "read/handled"
            read: tx.status !== 'pending', 
            icon: 'payments',
            activityId: tx.id
        };
    },

    /**
     * Convert Feedback thành Notification
     */
    feedbackToNotification: (feedback: any): Notification => {
        return {
            id: feedback.id,
            type: 'warning', // Important for admin attention
            title: 'Yêu cầu hỗ trợ mới',
            message: `${feedback.userName} gửi: "${feedback.title}" - ${feedback.content.substring(0, 50)}...`,
            timestamp: feedback.createdAt,
            read: feedback.status !== 'pending', // If not pending, considered handled
            icon: 'support_agent',
            activityId: feedback.id
        };
    },

    /**
     * Lấy danh sách notifications (từ ActivityLog)
     */
    getNotifications: async (limitCount: number = 20): Promise<Notification[]> => {
        try {
            const q = query(
                collection(db, 'activityLog'),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const activities: ActivityEntry[] = [];

            querySnapshot.forEach((doc) => {
                activities.push({ id: doc.id, ...doc.data() } as ActivityEntry);
            });

            // Convert activities thành notifications
            const readIds = notificationService.getReadIds();
            return activities.map(activity => notificationService.activityToNotification(activity, readIds));
        } catch (e) {
            console.error('Failed to get notifications', e);
            return [];
        }
    },

    /**
     * Subscribe real-time notifications
     */
    subscribeNotifications: (
        callback: (notifications: Notification[]) => void,
        limitCount: number = 20
    ) => {
        let activities: Notification[] = [];
        let transactions: Notification[] = [];
        let feedbacks: Notification[] = [];

        const updateAll = () => {
            const readIds = notificationService.getReadIds();
            
            // Re-map activities with fresh read status
            const updatedActivities = activities.map(n => ({
                ...n,
                read: readIds.includes(n.id)
            }));

            const combined = [...updatedActivities, ...transactions, ...feedbacks]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, limitCount);
            callback(combined);
        };

        const qActivity = query(
            collection(db, 'activityLog'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const qTx = query(
            collection(db, 'transactions'),
            where('status', '==', 'pending')
        );
        
        const qFeedback = query(
            collection(db, 'feedbacks'),
            where('status', '==', 'pending')
        );

        const unsubActivity = onSnapshot(qActivity, (snapshot) => {
            const readIds = notificationService.getReadIds();
            activities = snapshot.docs.map(doc => 
                notificationService.activityToNotification({ id: doc.id, ...doc.data() } as ActivityEntry, readIds)
            );
            updateAll();
        }, (error) => {
            console.error("Activity Notification Error:", error);
        });

        const unsubTx = onSnapshot(qTx, (snapshot) => {
            transactions = snapshot.docs.map(doc => 
                notificationService.transactionToNotification({ id: doc.id, ...doc.data() })
            );
            updateAll();
        }, (error) => {
            console.error("Transaction Notification Error:", error);
        });
        
        const unsubFeedback = onSnapshot(qFeedback, (snapshot) => {
            feedbacks = snapshot.docs.map(doc => 
                notificationService.feedbackToNotification({ id: doc.id, ...doc.data() })
            );
            updateAll();
        }, (error) => {
            console.error("Feedback Notification Error:", error);
        });

        return () => {
            unsubActivity();
            unsubTx();
            unsubFeedback();
        };
    }
};
