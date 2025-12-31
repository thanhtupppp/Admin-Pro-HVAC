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
import { Transaction, ServicePlan, AdminUser } from '../types';
export type { Transaction, ServicePlan, AdminUser };
import { emailService } from './emailService';
import { planService, Plan } from './planService';



export const paymentService = {
    getPlans: async (): Promise<Plan[]> => {
        try {
            const now = new Date().toISOString();
            const querySnapshot = await getDocs(collection(db, 'plans'));
            if (querySnapshot.empty) {
                // Fallback for initial load if DB is empty
                return [
                    {
                        id: 'free',
                        name: 'free',
                        displayName: 'Gói Miễn phí (Free)',
                        price: 0,
                        billingCycle: 'lifetime',
                        tier: 'Free',
                        description: 'Gói cơ bản',
                        status: 'active',
                        createdAt: now,
                        updatedAt: now,
                        features: [
                            { label: 'Tra cứu cơ bản', enabled: true },
                            { label: 'OCR 5 lần/ngày', enabled: true },
                            { label: 'Lịch sử cá nhân', enabled: true }
                        ]
                    },
                    {
                        id: 'premium',
                        name: 'premium',
                        displayName: 'Gói Chuyên nghiệp (Premium)',
                        price: 199000,
                        billingCycle: 'monthly',
                        tier: 'Premium',
                        description: 'Gói cao cấp',
                        status: 'active',
                        createdAt: now,
                        updatedAt: now,
                        features: [
                            { label: 'Tra cứu Full AI', enabled: true },
                            { label: 'OCR không giới hạn', enabled: true },
                            { label: 'Hỗ trợ 24/7', enabled: true },
                            { label: 'Tải tài liệu PDF', enabled: true }
                        ],
                        popular: true
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

    createTransaction: async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
        const now = new Date().toISOString();
        const newTx = {
            ...data,
            createdAt: now,
            updatedAt: now
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
            const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
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
                where('status', '==', status)
            );
            const querySnapshot = await getDocs(q);
            const txs: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                txs.push({ id: doc.id, ...doc.data() } as Transaction);
            });
            // Sort in memory to avoid composite index requirement
            return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
        await updateDoc(docRef, { 
            status,
            updatedAt: new Date().toISOString()
        });
    },

    /**
     * Activate plan for user (auto-update user.plan khi admin confirm)
     */
    activatePlan: async (userId: string, planId: string): Promise<void> => {
        try {
            const { userService } = await import('./userService');
            const { planService } = await import('./planService');

            // 1. Get user
            let user = await userService.getUser(userId);
            if (!user) {
                const users = await userService.getUsers();
                user = users.find(u => u.email === userId) || null;
            }

            if (!user) {
                console.error('User not found for activation:', userId);
                return;
            }

            // 2. Get plan details to determine type
            const plan = await planService.getPlan(planId);

            // 3. Use plan tier & Calculate Expiration
            const planType: AdminUser['plan'] = plan?.tier || 'Internal';

            // Calculate Expiration Date
            const now = new Date();
            let expiresAt: Date | null = null;
            
            if (planType !== 'Free') {
                const cycle = plan?.billingCycle || 'monthly';
                if (cycle === 'monthly') {
                    expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                } else if (cycle === 'yearly') {
                    expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
                } else {
                    // lifetime or unknown
                    expiresAt = new Date(now.getTime() + 99 * 365 * 24 * 60 * 60 * 1000); 
                }
            }

            // 4. Update user
            await userService.updateUser(user.id, { 
                plan: planType,
                planId: planId,
                planName: plan?.displayName || planId,
                planExpiresAt: expiresAt?.toISOString() || undefined
            });

            // 5. Log activity
            try {
                const { db } = await import('./firebaseConfig');
                const { addDoc, collection } = await import('firebase/firestore');
                await addDoc(collection(db, 'activityLog'), {
                    userId: 'system',
                    userName: 'Hệ thống',
                    action: 'UPDATE',
                    target: 'User Plan',
                    details: `Kích hoạt gói ${plan?.displayName || planId} cho ${user.email}`,
                    timestamp: new Date().toISOString(),
                    severity: 'info'
                });
            } catch (e) {
                console.warn('Activity log failed', e);
            }

            // 6. Send activation email
            await emailService.sendPlanActivated(user, planType);

            console.log(`✅ Activated ${planType} plan for user ${user.email}`);
        } catch (e) {
            console.error('Failed to activate plan:', e);
            throw e;
        }
    }
};
