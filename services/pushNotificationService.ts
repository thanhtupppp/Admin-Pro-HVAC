import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { PushNotification } from '../types';

const FCM_SERVER_KEY = 'BIcMzjsKl-n1PaUgrSQGHxB0PHArA9qXqdS9TUq-E1jtMvuKvEJqp30fKUTCUu4zKh2br9xOk6PW2qgGGRqby-8'; // TODO: Replace with actual key

export const pushNotificationService = {
  /**
   * Send push notification via Cloud Function (recommended)
   */
  sendViaCloudFunction: async (notification: PushNotification): Promise<void> => {
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const { app } = await import('./firebaseConfig');
      
      const functions = getFunctions(app);
      const sendNotification = httpsCallable(functions, 'sendNotification');
      
      const result = await sendNotification({
        title: notification.title,
        body: notification.body,
        targetType: notification.targetType,
        targetValue: notification.targetValue,
        data: notification.data,
      });

      const data = result.data as { success: boolean; successCount: number; failureCount: number };
      console.log(`✅ Notification sent: ${data.successCount} success, ${data.failureCount} failed`);
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      throw error;
    }
  },

  /**
   * Send push notification directly (for development only)
   * NOTE: Exposes server key in frontend - use Cloud Function in production
   */
  sendDirect: async (notification: PushNotification): Promise<void> => {
    try {
      // Get FCM tokens based on target
      const tokens = await pushNotificationService.getTargetTokens(
        notification.targetType,
        notification.targetValue
      );

      if (tokens.length === 0) {
        throw new Error('No FCM tokens found for target');
      }

      // Send to each token
      const fcmUrl = 'https://fcm.googleapis.com/fcm/send';
      
      const promises = tokens.map((token) =>
        fetch(fcmUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${FCM_SERVER_KEY}`,
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: notification.data || {},
          }),
        })
      );

      await Promise.all(promises);
      console.log(`✅ Sent notification to ${tokens.length} devices`);
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      throw error;
    }
  },

  /**
   * Get FCM tokens based on target type
   */
  getTargetTokens: async (
    targetType: 'all' | 'user' | 'plan',
    targetValue?: string
  ): Promise<string[]> => {
    try {
      let q;

      if (targetType === 'all') {
        // Get all users with FCM tokens
        q = query(collection(db, 'users'));
      } else if (targetType === 'user' && targetValue) {
        // Get specific user
        q = query(collection(db, 'users'), where('__name__', '==', targetValue));
      } else if (targetType === 'plan' && targetValue) {
        // Get users by plan
        q = query(collection(db, 'users'), where('plan', '==', targetValue));
      } else {
        return [];
      }

      const snapshot = await getDocs(q);
      const tokens: string[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as { fcmToken?: string };
        const fcmToken = data.fcmToken;
        if (fcmToken) {
          tokens.push(fcmToken);
        }
      });

      return tokens;
    } catch (error) {
      console.error('Failed to get target tokens:', error);
      return [];
    }
  },

  /**
   * Save notification to history (optional)
   */
  saveToHistory: async (notification: PushNotification): Promise<void> => {
    try {
      const historyData: any = {
        title: notification.title,
        body: notification.body,
        targetType: notification.targetType,
        sentAt: new Date().toISOString(),
      };

      // Only add targetValue if it's defined
      if (notification.targetValue) {
        historyData.targetValue = notification.targetValue;
      }

      // Only add data if it's defined
      if (notification.data) {
        historyData.data = notification.data;
      }

      await addDoc(collection(db, 'notificationHistory'), historyData);
    } catch (error) {
      console.error('Failed to save notification to history:', error);
    }
  },
};
