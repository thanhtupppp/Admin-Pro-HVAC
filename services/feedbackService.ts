import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    where,
    deleteDoc
} from 'firebase/firestore';
import { Feedback } from '../types';

export const feedbackService = {
    /**
     * Get all feedbacks (Admin)
     */
    getFeedbacks: async (): Promise<Feedback[]> => {
        try {
            const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const feedbacks: Feedback[] = [];
            querySnapshot.forEach((doc) => {
                feedbacks.push({ id: doc.id, ...doc.data() } as Feedback);
            });
            return feedbacks;
        } catch (error) {
            console.error('Failed to get feedbacks', error);
            return [];
        }
    },

    /**
     * Get feedbacks by user (Mobile)
     */
    getUserFeedbacks: async (userId: string): Promise<Feedback[]> => {
        try {
            const q = query(
                collection(db, 'feedbacks'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const feedbacks: Feedback[] = [];
            querySnapshot.forEach((doc) => {
                feedbacks.push({ id: doc.id, ...doc.data() } as Feedback);
            });
            return feedbacks;
        } catch (error) {
            console.error('Failed to get user feedbacks', error);
            return [];
        }
    },

    /**
     * Create new feedback (Mobile)
     */
    createFeedback: async (data: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Feedback> => {
        try {
            const now = new Date().toISOString();
            const newFeedback = {
                ...data,
                status: 'pending',
                createdAt: now,
                updatedAt: now
            };
            const docRef = await addDoc(collection(db, 'feedbacks'), newFeedback);
            
            // Create activity log for admin notification
            try {
                await addDoc(collection(db, 'activityLog'), {
                    action: 'CREATE',
                    target: 'Feedback',
                    targetId: docRef.id,
                    userId: data.userId,
                    userName: data.userName,
                    userEmail: data.userEmail,
                    details: `Yêu cầu hỗ trợ mới: ${data.title}`,
                    severity: 'info',
                    timestamp: now
                });
            } catch (logError) {
                console.error('Failed to create activity log', logError);
            }
            
            return { id: docRef.id, ...newFeedback } as Feedback;
        } catch (error) {
            console.error('Failed to create feedback', error);
            throw error;
        }
    },

    /**
     * Update feedback status & reply (Admin)
     */
    replyFeedback: async (
        id: string,
        reply: string,
        status: Feedback['status'] = 'resolved',
        adminName: string = 'Admin'
    ): Promise<void> => {
        try {
            const docRef = doc(db, 'feedbacks', id);
            const now = new Date().toISOString();
            
            await updateDoc(docRef, {
                adminReply: reply,
                replyBy: adminName,
                repliedAt: now,
                status: status,
                updatedAt: now
            });
            
            // Note: Mobile app will get notified via real-time listener on feedbacks collection
            // No need to create activity log for user notification
        } catch (error) {
            console.error('Failed to reply feedback', error);
            throw error;
        }
    }
};
