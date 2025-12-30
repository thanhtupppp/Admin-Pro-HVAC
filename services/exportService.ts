import { unparse } from 'papaparse';
import { userService } from './userService';
import { paymentService } from './paymentService';
import { errorService } from './errorService';
import { planService } from './planService';
import { brandService } from './brandService';

/**
 * Download file helper
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Format date for filename
 */
const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
};

export const exportService = {
    /**
     * Export users to CSV
     */
    exportUsers: async () => {
        try {
            const users = await userService.getUsers();
            const csv = unparse(users);
            const filename = `users_export_${getTimestamp()}.csv`;
            downloadFile(csv, filename, 'text/csv;charset=utf-8;');
            return { success: true, count: users.length };
        } catch (e) {
            console.error('Export users failed:', e);
            throw new Error('Failed to export users');
        }
    },

    /**
     * Export transactions to CSV
     */
    exportTransactions: async () => {
        try {
            const transactions = await paymentService.getTransactions();
            const csv = unparse(transactions);
            const filename = `transactions_export_${getTimestamp()}.csv`;
            downloadFile(csv, filename, 'text/csv;charset=utf-8;');
            return { success: true, count: transactions.length };
        } catch (e) {
            console.error('Export transactions failed:', e);
            throw new Error('Failed to export transactions');
        }
    },

    /**
     * Export error codes to CSV
     */
    exportErrorCodes: async () => {
        try {
            const errors = await errorService.getErrors();
            const csv = unparse(errors);
            const filename = `error_codes_export_${getTimestamp()}.csv`;
            downloadFile(csv, filename, 'text/csv;charset=utf-8;');
            return { success: true, count: errors.length };
        } catch (e) {
            console.error('Export error codes failed:', e);
            throw new Error('Failed to export error codes');
        }
    },

    /**
     * Export plans to CSV
     */
    exportPlans: async () => {
        try {
            const plans = await planService.getPlans();
            const csv = unparse(plans);
            const filename = `plans_export_${getTimestamp()}.csv`;
            downloadFile(csv, filename, 'text/csv;charset=utf-8;');
            return { success: true, count: plans.length };
        } catch (e) {
            console.error('Export plans failed:', e);
            throw new Error('Failed to export plans');
        }
    },

    /**
     * Export brands to CSV
     */
    exportBrands: async () => {
        try {
            const brands = await brandService.getBrands();
            const csv = unparse(brands);
            const filename = `brands_export_${getTimestamp()}.csv`;
            downloadFile(csv, filename, 'text/csv;charset=utf-8;');
            return { success: true, count: brands.length };
        } catch (e) {
            console.error('Export brands failed:', e);
            throw new Error('Failed to export brands');
        }
    },

    /**
     * Full backup - Export all data to JSON
     */
    fullBackup: async () => {
        try {
            const [users, transactions, errors, plans, brands] = await Promise.all([
                userService.getUsers(),
                paymentService.getTransactions(),
                errorService.getErrors(),
                planService.getPlans(),
                brandService.getBrands()
            ]);

            const backup = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: {
                    users,
                    transactions,
                    errors,
                    plans,
                    brands
                },
                stats: {
                    usersCount: users.length,
                    transactionsCount: transactions.length,
                    errorsCount: errors.length,
                    plansCount: plans.length,
                    brandsCount: brands.length
                }
            };

            const json = JSON.stringify(backup, null, 2);
            const filename = `full_backup_${getTimestamp()}.json`;
            downloadFile(json, filename, 'application/json');

            return {
                success: true,
                stats: backup.stats
            };
        } catch (e) {
            console.error('Full backup failed:', e);
            throw new Error('Failed to create full backup');
        }
    }
};
