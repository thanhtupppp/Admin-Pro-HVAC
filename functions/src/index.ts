import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface SendNotificationRequest {
  title: string;
  body: string;
  targetType: 'all' | 'user' | 'plan';
  targetValue?: string;
  data?: Record<string, string>;
}

export const sendNotification = functions.https.onCall(
  async (data: SendNotificationRequest, context) => {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to send notifications'
      );
    }

    // Optional: Check if user is admin
    // const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    // if (userDoc.data()?.role !== 'Super Admin') {
    //   throw new functions.https.HttpsError('permission-denied', 'Only admins can send notifications');
    // }

    const { title, body, targetType, targetValue, data: notificationData } = data;

    // Get target FCM tokens
    let tokensQuery;
    const db = admin.firestore();

    if (targetType === 'all') {
      tokensQuery = db.collection('users');
    } else if (targetType === 'user' && targetValue) {
      tokensQuery = db.collection('users').where(admin.firestore.FieldPath.documentId(), '==', targetValue);
    } else if (targetType === 'plan' && targetValue) {
      tokensQuery = db.collection('users').where('plan', '==', targetValue);
    } else {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid target type or value');
    }

    const snapshot = await tokensQuery.get();
    const tokens: string[] = [];

    snapshot.forEach((doc) => {
      const fcmToken = doc.data().fcmToken;
      if (fcmToken) {
        tokens.push(fcmToken);
      }
    });

    if (tokens.length === 0) {
      throw new functions.https.HttpsError('not-found', 'No FCM tokens found for target');
    }

    // Send notifications
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      data: notificationData || {},
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Log results
    console.log(`✅ Successfully sent ${response.successCount} notifications`);
    console.log(`❌ Failed to send ${response.failureCount} notifications`);

    // Save notification to each user's notifications subcollection
    const batch = db.batch();
    snapshot.forEach((doc) => {
      const notificationRef = db.collection('users').doc(doc.id).collection('notifications').doc();
      batch.set(notificationRef, {
        title,
        body,
        data: notificationData || {},
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    // Save to history
    await db.collection('notificationHistory').add({
      title,
      body,
      targetType,
      targetValue,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: context.auth.uid,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: tokens.length,
    };
  }
);
