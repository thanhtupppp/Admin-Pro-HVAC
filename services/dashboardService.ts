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
     * Export dashboard to PDF using browser print
     */
    exportToPDF: async (stats: DashboardStats): Promise<void> => {
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Dashboard Report - ${new Date().toLocaleDateString('vi-VN')}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; background: white; }
                    h1 { color: #1a73e8; margin-bottom: 10px; }
                    .date { color: #666; margin-bottom: 30px; }
                    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                    .stat-card { border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; }
                    .stat-label { font-size: 14px; color: #666; text-transform: uppercase; font-weight: bold; }
                    .stat-value { font-size: 36px; color: #1a73e8; margin: 10px 0; font-weight: bold; }
                    .stat-trend { font-size: 14px; color: #34a853; }
                    .stat-trend.negative { color: #ea4335; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Admin Pro HVAC - Dashboard Report</h1>
                <p class="date">Ngày xuất: ${new Date().toLocaleString('vi-VN')}</p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Tổng người dùng</div>
                        <div class="stat-value">${stats.totalUsers}</div>
                        <div class="stat-trend ${stats.trends.users < 0 ? 'negative' : ''}">
                            ${stats.trends.users > 0 ? '▲' : stats.trends.users < 0 ? '▼' : ''}
                            ${Math.abs(stats.trends.users).toFixed(1)}% so với tháng trước
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-label">Doanh thu</div>
                        <div class="stat-value">${(stats.totalRevenue / 1000000).toFixed(2)}M VNĐ</div>
                        <div class="stat-trend ${stats.trends.revenue < 0 ? 'negative' : ''}">
                            ${stats.trends.revenue > 0 ? '▲' : stats.trends.revenue < 0 ? '▼' : ''}
                            ${Math.abs(stats.trends.revenue).toFixed(1)}% tăng trưởng
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-label">Giao dịch chờ duyệt</div>
                        <div class="stat-value">${stats.pendingApprovals}</div>
                        <div class="stat-trend">thanh toán đang chờ</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-label">Lỗi đang xử lý</div>
                        <div class="stat-value">${stats.activeErrors}</div>
                        <div class="stat-trend ${stats.trends.errors < 0 ? 'negative' : ''}">
                            ${stats.trends.errors > 0 ? '▲' : stats.trends.errors < 0 ? '▼' : ''}
                            ${Math.abs(stats.trends.errors).toFixed(1)}% so với trước
                        </div>
                    </div>
                </div>
                
                <button class="no-print" onclick="window.print()" 
                    style="margin-top: 30px; padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                    In hoặc lưu PDF
                </button>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
        } else {
            alert('Vui lòng cho phép popup để xuất PDF');
        }
    }
};
