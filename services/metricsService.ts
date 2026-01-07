import { db } from './firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, Timestamp, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { userService } from './userService';
import { paymentService } from './paymentService';

export interface Metrics {
    premiumUsersCount: number;
    totalUsersCount: number;
    conversionRate: number; // percentage
    mrr: number; // Monthly Recurring Revenue
    totalRevenue: number;
    pendingTransactions: number;
}

export interface AIMetrics {
    requestsUsed: number;
    requestsLimit: number;
    tokensInput: number;
    tokensOutput: number;
    estimatedCost: number;
    model: string;
    lastUpdated?: Date;
}

export const metricsService = {
    /**
     * Calculate all metrics từ Firestore
     */
    calculateMetrics: async (): Promise<Metrics> => {
        try {
            // 1. Get all users
            const users = await userService.getUsers();
            const totalUsersCount = users.length;
            const premiumUsersCount = users.filter(u => u.plan === 'Premium').length;

            // 2. Calculate conversion rate
            const conversionRate = totalUsersCount > 0
                ? (premiumUsersCount / totalUsersCount) * 100
                : 0;

            // 3. Get all transactions
            const transactions = await paymentService.getTransactions();

            // 4. Calculate total revenue (completed transactions)
            const completedTransactions = transactions.filter(tx => tx.status === 'completed');
            const totalRevenue = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

            // 5. Calculate MRR (Monthly Recurring Revenue)
            // Giả sử tất cả Premium users pay monthly
            // MRR = số Premium users * giá gói Premium
            const premiumPrice = 199000; // TODO: Get from planService
            const mrr = premiumUsersCount * premiumPrice;

            // 6. Count pending transactions
            const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;

            return {
                premiumUsersCount,
                totalUsersCount,
                conversionRate,
                mrr,
                totalRevenue,
                pendingTransactions
            };
        } catch (e) {
            console.error('Failed to calculate metrics', e);
            return {
                premiumUsersCount: 0,
                totalUsersCount: 0,
                conversionRate: 0,
                mrr: 0,
                totalRevenue: 0,
                pendingTransactions: 0
            };
        }
    },

    /**
     * Format number to readable string
     */
    formatCurrency: (amount: number): string => {
        if (amount >= 1_000_000_000) {
            return `${(amount / 1_000_000_000).toFixed(1)} B`;
        } else if (amount >= 1_000_000) {
            return `${(amount / 1_000_000).toFixed(1)} M`;
        } else if (amount >= 1_000) {
            return `${(amount / 1_000).toFixed(1)} K`;
        }
        return amount.toLocaleString();
    },

    /**
     * Format percentage
     */
    formatPercentage: (value: number): string => {
        return `${value.toFixed(1)}% `;
    },

    /**
     * Real-time subscription to AI metrics
     */
    subscribeToMetrics: (callback: (metrics: AIMetrics) => void) => {
        try {
            const docRef = doc(db, 'aiMetrics', 'current');

            return onSnapshot(docRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    callback({
                        requestsUsed: data.requestsUsed || 0,
                        requestsLimit: data.requestsLimit || 100,
                        tokensInput: data.tokensInput || 0,
                        tokensOutput: data.tokensOutput || 0,
                        estimatedCost: data.estimatedCost || 0,
                        model: data.model || 'gemini-2.5-flash',
                        lastUpdated: data.lastUpdated?.toDate?.() || new Date()
                    });
                } else {
                    // Initialize với default values
                    callback({
                        requestsUsed: 0,
                        requestsLimit: 100,
                        tokensInput: 0,
                        tokensOutput: 0,
                        estimatedCost: 0,
                        model: 'gemini-2.5-flash',
                        lastUpdated: new Date()
                    });
                }
            }, (error) => {
                console.error('Metrics subscription error:', error);
            });
        } catch (error) {
            console.error('Failed to subscribe to metrics:', error);
            return () => { };
        }
    },

    /**
     * Update AI metrics after API call
     */
    updateMetrics: async (increment: {
        requests?: number;
        tokensInput?: number;
        tokensOutput?: number;
    }): Promise<void> => {
        try {
            const docRef = doc(db, 'aiMetrics', 'current');
            const current = await getDoc(docRef);

            if (current.exists()) {
                const data = current.data();
                const newTokensInput = (data.tokensInput || 0) + (increment.tokensInput || 0);
                const newTokensOutput = (data.tokensOutput || 0) + (increment.tokensOutput || 0);

                // Calculate cost (example pricing)
                const inputCost = newTokensInput * 0.000001; // $1 per 1M tokens
                const outputCost = newTokensOutput * 0.000002; // $2 per 1M tokens

                await updateDoc(docRef, {
                    requestsUsed: (data.requestsUsed || 0) + (increment.requests || 0),
                    tokensInput: newTokensInput,
                    tokensOutput: newTokensOutput,
                    estimatedCost: inputCost + outputCost,
                    lastUpdated: Timestamp.now()
                });
            } else {
                // Initialize
                await setDoc(docRef, {
                    requestsUsed: increment.requests || 0,
                    requestsLimit: 100,
                    tokensInput: increment.tokensInput || 0,
                    tokensOutput: increment.tokensOutput || 0,
                    estimatedCost: 0,
                    model: 'gemini-2.5-flash',
                    lastUpdated: Timestamp.now()
                });
            }
        } catch (error) {
            console.error('Failed to update metrics:', error);
        }
    },

    /**
     * Reset monthly metrics (call này nên được gọi từ Cloud Function vào ngày 1 hàng tháng)
     */
    resetMonthlyMetrics: async (): Promise<void> => {
        try {
            const docRef = doc(db, 'aiMetrics', 'current');
            await setDoc(docRef, {
                requestsUsed: 0,
                requestsLimit: 100,
                tokensInput: 0,
                tokensOutput: 0,
                estimatedCost: 0,
                model: 'gemini-2.5-flash',
                lastUpdated: Timestamp.now()
            });
        } catch (error) {
            console.error('Failed to reset metrics:', error);
        }
    }
};
