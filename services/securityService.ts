import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  limit, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig'; // Adjust path if needed

export interface ViolationLog {
  id: string;
  userId: string;
  userEmail: string;
  reason: string;
  count: number;
  type: string;
  timestamp: any;
  platform: string;
  resolved?: boolean;
  resolvedAt?: any;
}

export const securityService = {
  // Get recent suspicious activities
  getSuspiciousActivities: async (checkLimit = 50): Promise<ViolationLog[]> => {
    try {
      const q = query(
        collection(db, 'suspicious_activities'),
        orderBy('timestamp', 'desc'),
        limit(checkLimit)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ViolationLog));
    } catch (error) {
      console.error('Error fetching suspicious activities:', error);
      throw error;
    }
  },

  // Unlock a user account
  unlockUser: async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'active', // or 'verified' based on your logic
        lockReason: null, // Clear the reason
        unlockedAt: new Date()
      });
      console.log(`User ${userId} unlocked.`);
    } catch (error) {
      console.error('Error unlocking user:', error);
      throw error;
    }
  },

  // Resolve a specific suspicious activity log
  resolveSuspiciousActivity: async (activityId: string) => {
    try {
      const activityRef = doc(db, 'suspicious_activities', activityId);
      await updateDoc(activityRef, {
        resolved: true,
        resolvedAt: new Date()
      });
      console.log(`Activity ${activityId} resolved.`);
    } catch (error) {
       console.error('Error resolving activity:', error);
       throw error;
    }
  }
};
