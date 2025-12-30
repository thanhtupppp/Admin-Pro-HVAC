import { db } from './firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
            return `${(amount / 1_000_000_000).toFixed(1)}B`;
        } else if (amount >= 1_000_000) {
            return `${(amount / 1_000_000).toFixed(1)}M`;
        } else if (amount >= 1_000) {
            return `${(amount / 1_000).toFixed(1)}K`;
        }
        return amount.toLocaleString();
    },

    /**
     * Format percentage
     */
    formatPercentage: (value: number): string => {
        return `${value.toFixed(1)}%`;
    }
};
