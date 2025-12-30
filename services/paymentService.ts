import { db } from './firebaseConfig';
import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    where,
    doc,
    updateDoc
} from 'firebase/firestore';
import { Transaction, ServicePlan } from '../types';
import { planService } from './planService';
import { emailService } from './emailService';


export interface Plan {
    id: string;
    name: string;
    price: number;
    period: string; // 'month', 'year', 'forever'
    features: string[];
    isPopular?: boolean;
}



export const paymentService = {
    getPlans: async (): Promise<Plan[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, 'plans'));
            if (querySnapshot.empty) {
                // Fallback for initial load if DB is empty
                return [
                    {
                        id: 'free',
                        name: 'Gói Miễn phí (Free)',
                        price: 0,
                        period: 'forever',
                        features: ['Tra cứu cơ bản', 'OCR 5 lần/ngày', 'Lịch sử cá nhân']
                    },
                    {
                        id: 'premium',
                        name: 'Gói Chuyên nghiệp (Premium)',
                        price: 199000,
                        period: 'month',
                        features: ['Tra cứu Full AI', 'OCR không giới hạn', 'Hỗ trợ 24/7', 'Tải tài liệu PDF'],
                        isPopular: true
                    }
                ];
            }
            const plans: Plan[] = [];
            querySnapshot.forEach((doc) => {
                plans.push({ id: doc.id, ...doc.data() } as Plan);
            });
            return plans;
        } catch (e) {
            return [];
        }
    },

    createTransaction: async (data: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
        const newTx = {
            ...data,
            date: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'transactions'), newTx);
        const createdTx = { id: docRef.id, ...newTx } as Transaction;

        if (createdTx.status === 'completed') {
            // Send payment success email
            // Note: createTransaction data likely has userId, but we need email/name.
            // If the caller doesn't provide it, we might skip or fetch user here.
            // Assuming for now simple integration or we fetch user.
            try {
                const { userService } = await import('./userService');
                const users = await userService.getUsers();
                const user = users.find(u => u.id === createdTx.userId);
                if (user) {
                    await emailService.sendPaymentSuccess(createdTx, user.email, user.username);
                }
            } catch (e) {
                console.warn('Auto-email payment success failed:', e);
            }
        }

        return createdTx;
    },

    getTransactions: async (): Promise<Transaction[]> => {
        try {
            const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            const txs: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                txs.push({ id: doc.id, ...doc.data() } as Transaction);
            });
            return txs;
        } catch (e) {
            console.error('Failed to get transactions', e);
            return [];
        }
    },

    /**
     * Filter transactions by status
     */
    getTransactionsByStatus: async (status: Transaction['status']): Promise<Transaction[]> => {
        try {
            const q = query(
                collection(db, 'transactions'),
                where('status', '==', status),
                orderBy('date', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const txs: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                txs.push({ id: doc.id, ...doc.data() } as Transaction);
            });
            return txs;
        } catch (e) {
            console.error('Failed to get transactions by status', e);
            return [];
        }
    },

    /**
     * Update transaction status (Admin confirm/reject)
     */
    updateTransactionStatus: async (id: string, status: Transaction['status']): Promise<void> => {
        const docRef = doc(db, 'transactions', id);
        await updateDoc(docRef, { status });
    },

    /**
     * Activate plan for user (auto-update user.plan khi admin confirm)
     */
    activatePlan: async (userId: string, planId: string): Promise<void> => {
        try {
            // Import dynamically để tránh circular dependency
            const { userService } = await import('./userService');

            // Get user từ collection
            const users = await userService.getUsers();
            const user = users.find(u => u.id === userId || u.email === userId);

            if (!user) {
                console.error('User not found:', userId);
                return;
            }

            // Update user plan (cast to correct type)
            const planType = planId === 'premium' || planId === 'Premium' ? 'Premium' :
                planId === 'free' || planId === 'Free' ? 'Free' : 'Internal';
            await userService.updateUser(user.id, { plan: planType });

            // Send activation email
            await emailService.sendPlanActivated(user, planType);

            console.log(`✅ Activated ${planId} plan for user ${userId}`);
        } catch (e) {
            console.error('Failed to activate plan:', e);
            throw e;
        }
    }
};
