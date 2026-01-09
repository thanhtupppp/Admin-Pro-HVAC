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
                        billingCycle: 'monthly', // fallback valid value
                        tier: 'Free',
                        description: 'Gói cơ bản',
                        status: 'active',
                        createdAt: now,
                        updatedAt: now,
                        features: [
                            'Tra cứu cơ bản',
                            'OCR 5 lần/ngày',
                            'Lịch sử cá nhân'
                        ],
                        limits: { maxUsers: 1, maxErrorCodes: 100, aiQuota: 5 }
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
                            'Tra cứu Full AI',
                            'OCR không giới hạn',
                            'Hỗ trợ 24/7',
                            'Tải tài liệu PDF'
                        ],
                        limits: { maxUsers: 5, maxErrorCodes: 9999, aiQuota: 9999 },
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
        
        // 1. Get transaction to know userId and planId
        const { getDoc } = await import('firebase/firestore');
        const txDoc = await getDoc(docRef);
        
        if (!txDoc.exists()) {
            throw new Error('Transaction not found');
        }

        const txData = txDoc.data() as Transaction;

        // 2. Update status
        await updateDoc(docRef, { 
            status,
            updatedAt: new Date().toISOString()
        });

        // 3. If Completed -> Activate Plan
        if (status === 'completed' && txData.status !== 'completed') {
            await paymentService.activatePlan(txData.userId, txData.planId);
        }
    },

    /**
     * Activate plan for user (auto-update user.plan with smart extension logic)
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

            // 2. Get plan details
            const plan = await planService.getPlan(planId);
            const newPlanTier: AdminUser['plan'] = plan?.tier || 'Internal';

            // 3. Smart Expiration Logic
            const now = new Date().getTime();
            let currentExpiry = user.planExpiresAt ? new Date(user.planExpiresAt).getTime() : 0;
            
            // If current expiry is in the past, reset to now
            if (currentExpiry < now) {
                currentExpiry = now;
            }

            // Calculate duration
            const cycle = plan?.billingCycle || 'monthly';
            let duration = 0;
            if (cycle === 'monthly') {
                duration = 30 * 24 * 60 * 60 * 1000;
            } else if (cycle === 'yearly') {
                duration = 365 * 24 * 60 * 60 * 1000;
            } else {
                duration = 99 * 365 * 24 * 60 * 60 * 1000; // Lifetime
            }

            let newExpiresAt = new Date();

            // Check hierarchy or same plan
            // Tier values for comparison
            const tierValue = { 'Free': 0, 'Basic': 1, 'Premium': 2, 'Enterprise': 3, 'Internal': 99 };
            const currentTierVal = tierValue[user.plan as keyof typeof tierValue] || 0;
            const newTierVal = tierValue[newPlanTier as keyof typeof tierValue] || 0;

            if (newPlanTier !== 'Free') {
                if (newTierVal === currentTierVal) {
                    // SAME TIER: Extend time
                    // New expiry = current valid expiry + duration
                    newExpiresAt = new Date(currentExpiry + duration);
                    console.log(`🔄 Extending ${newPlanTier} for user. Added ${duration/86400000} days.`);
                } else if (newTierVal > currentTierVal) {
                    // UPGRADE: Start fresh from now (or could be pro-rated but complex)
                    // Let's explicitly start from NOW for the new higher tier
                    newExpiresAt = new Date(now + duration);
                    console.log(`🔼 Upgrading to ${newPlanTier}. Expires in ${duration/86400000} days.`);
                } else {
                    // DOWNGRADE: This turns into an overwrite in this implementation
                    // Admins usually shouldn't approve a downgrade unless intended.
                    newExpiresAt = new Date(now + duration);
                    console.log(`🔽 Downgrading/Changing to ${newPlanTier}.`);
                }
            }

            // 4. Update user
            await userService.updateUser(user.id, { 
                plan: newPlanTier,
                planId: planId,
                planName: plan?.displayName || planId,
                planExpiresAt: newExpiresAt.toISOString()
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
                    details: `Kích hoạt gói ${plan?.displayName || planId} cho ${user.email} (Hết hạn: ${newExpiresAt.toLocaleDateString('vi-VN')})`,
                    timestamp: new Date().toISOString(),
                    severity: 'info'
                });
            } catch (e) {
                console.warn('Activity log failed', e);
            }

            // 6. Send activation email
            await emailService.sendPlanActivated(user, newPlanTier);

        } catch (e) {
            console.error('Failed to activate plan:', e);
            throw e;
        }
    },

    /**
     * RESET DATA (DEV ONLY)
     * Clears all transactions and resets all users to Free plan.
     */
    resetSystemData: async (): Promise<void> => {
        try {
            const { deleteDoc, getDocs, collection, doc, updateDoc } = await import('firebase/firestore');
            const { db } = await import('./firebaseConfig');

            // 1. Delete all transactions
            const txSnapshot = await getDocs(collection(db, 'transactions'));
            const deleteTxPromises = txSnapshot.docs.map(d => deleteDoc(doc(db, 'transactions', d.id)));
            await Promise.all(deleteTxPromises);
            console.log(`🗑️ Deleted ${deleteTxPromises.length} transactions.`);

            // 2. Reset all users to Free
            const userSnapshot = await getDocs(collection(db, 'users'));
            const resetUserPromises = userSnapshot.docs.map(d => 
                updateDoc(doc(db, 'users', d.id), {
                    plan: 'Free',
                    planId: 'free',
                    planName: 'Gói Miễn phí',
                    planExpiresAt: null // Firestore can verify this deletes or sets to null
                })
            );
            await Promise.all(resetUserPromises);
            console.log(`🔄 Reset ${resetUserPromises.length} users to Free plan.`);

        } catch (e) {
            console.error('Failed to reset system data', e);
            throw e;
        }
    }
};
