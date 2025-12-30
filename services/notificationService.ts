import { Notification, ActivityEntry } from '../types';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
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
        const q = query(
            collection(db, 'activityLog'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        return onSnapshot(q, (querySnapshot) => {
            const activities: ActivityEntry[] = [];
            querySnapshot.forEach((doc) => {
                activities.push({ id: doc.id, ...doc.data() } as ActivityEntry);
            });

            const notifications = activities.map(activity =>
                notificationService.activityToNotification(activity)
            );

            callback(notifications);
        });
    }
};
