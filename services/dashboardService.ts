import { db } from './firebaseConfig';
import { collection, onSnapshot, query, where, Timestamp, Unsubscribe } from 'firebase/firestore';

export interface DashboardStats {
    totalUsers: number;
    totalRevenue: number;
    pendingApprovals: number;
    activeErrors: number;
    trends: {
        users: number;
        revenue: number;
        approvals: number;
        errors: number;
    };
}

/**
 * Dashboard Service - Real-time stats and trend calculations
 */
export const dashboardService = {
    /**
     * Get dashboard statistics with real-time updates
     * @param callback - Function to call when stats update
     * @returns Unsubscribe function
     */
    getStatsRealtime: (callback: (stats: DashboardStats) => void): Unsubscribe => {
        const stats: DashboardStats = {
            totalUsers: 0,
            totalRevenue: 0,
            pendingApprovals: 0,
            activeErrors: 0,
            trends: { users: 0, revenue: 0, approvals: 0, errors: 0 }
        };

        // Users listener
        const unsubUsers = onSnapshot(
            collection(db, 'users'),
            (snapshot) => {
                stats.totalUsers = snapshot.size;
                callback({ ...stats });
            },
            (error) => console.error('Users snapshot error:', error)
        );

        // Transactions listener (completed only)
        const unsubTransactions = onSnapshot(
            query(collection(db, 'transactions'), where('status', '==', 'completed')),
            (snapshot) => {
                stats.totalRevenue = snapshot.docs.reduce(
                    (sum, doc) => sum + (doc.data().amount || 0),
                    0
                );
                callback({ ...stats });
            },
            (error) => console.error('Transactions snapshot error:', error)
        );

        // Pending approvals listener
        const unsubPending = onSnapshot(
            query(collection(db, 'transactions'), where('status', '==', 'pending')),
            (snapshot) => {
                stats.pendingApprovals = snapshot.size;
                callback({ ...stats });
            },
            (error) => console.error('Pending snapshot error:', error)
        );

        // Active errors listener
        const unsubErrors = onSnapshot(
            query(collection(db, 'errorCodes'), where('status', '==', 'active')),
            (snapshot) => {
                stats.activeErrors = snapshot.size;
                callback({ ...stats });
            },
            (error) => console.error('Errors snapshot error:', error)
        );

        // Return combined unsubscribe function
        return () => {
            unsubUsers();
            unsubTransactions();
            unsubPending();
            unsubErrors();
        };
    },

    /**
     * Calculate trend percentage
     * @param current - Current value
     * @param previous - Previous period value
     * @returns Percentage change
     */
    calculateTrend: (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    },

    /**
     * Export dashboard to PDF
     * @param dashboardElement - HTML element to export
     * @param filename - Output filename
     */
    exportToPDF: async (dashboardElement: HTMLElement, filename: string = 'dashboard.pdf'): Promise<void> => {
        try {
            // Dynamic imports to reduce bundle size
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).jsPDF;

            const canvas = await html2canvas(dashboardElement, {
                scale: 2,
                backgroundColor: '#0a0a0a',
                logging: false,
                useCORS: true,
                allowTaint: true,
                // Skip problematic elements like pulsing animations
                ignoreElements: (element) => {
                    return element.classList?.contains('animate-pulse') || false;
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('landscape', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(filename);
        } catch (error) {
            console.error('PDF export failed:', error);
            throw new Error('Không thể xuất PDF. Vui lòng thử lại.');
        }
    }
};
