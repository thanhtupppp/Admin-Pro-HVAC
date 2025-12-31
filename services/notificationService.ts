import { Notification, ActivityEntry } from '../types';
import { collection, query, orderBy, limit, getDocs, onSnapshot, where } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const notificationService = {
    /**
     * Convert ActivityEntry thành Notification
     */
    activityToNotification: (activity: ActivityEntry): Notification => {
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
            read: false,
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
            read: tx.status !== 'pending', // Assume read if not pending
            icon: 'payments',
            activityId: tx.id // Using tx.id as identifier
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
            return activities.map(activity => notificationService.activityToNotification(activity));
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

        const updateAll = () => {
            const combined = [...activities, ...transactions]
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

        const unsubActivity = onSnapshot(qActivity, (snapshot) => {
            activities = snapshot.docs.map(doc => 
                notificationService.activityToNotification({ id: doc.id, ...doc.data() } as ActivityEntry)
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
            console.error("Transaction Notification Error (Likely missing index):", error);
            // Fallback: try without orderBy if it fails? 
            // Actually qTx above doesn't have orderBy, so it shouldn't fail.
        });

        return () => {
            unsubActivity();
            unsubTx();
        };
    }
};
