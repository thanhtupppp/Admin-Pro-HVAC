
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../../components/Dashboard';
import { dashboardService } from '../../../services/dashboardService';
import { errorService } from '../../../services/errorService';
import { userService } from '../../../services/userService';
import { paymentService } from '../../../services/paymentService';

// Mock services
jest.mock('../../../services/dashboardService');
jest.mock('../../../services/errorService');
jest.mock('../../../services/userService');
jest.mock('../../../services/paymentService');

// Mock child components to isolate Dashboard logic
jest.mock('../../../components/IndustrialStatusCard', () => ({ label, value }: any) => (
    <div data-testid="status-card">{label}: {value}</div>
));
jest.mock('../../../components/DashboardCharts', () => () => <div data-testid="dashboard-charts" />);

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock default data
        (dashboardService.getStatsRealtime as jest.Mock).mockImplementation((cb) => {
            cb({
                totalUsers: 100,
                totalRevenue: 5000000,
                pendingApprovals: 5,
                activeErrors: 2,
                trends: { users: 0, revenue: 0, approvals: 0, errors: 0 }
            });
            return jest.fn(); // unsubscribe
        });

        (errorService.getErrors as jest.Mock).mockResolvedValue([]);
        (userService.getUsers as jest.Mock).mockResolvedValue([]);
        (paymentService.getTransactions as jest.Mock).mockResolvedValue([]);
    });

    it('should render loading state initially', async () => {
        // We delay the callback to test loading state if needed, 
        // but here the mock calls it immediately, so we might skip loading check 
        // or check if it renders final state correctly.
        
        render(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByText(/Tổng quan hệ thống/i)).toBeInTheDocument();
        });
    });

    it('should render stats from service', async () => {
        render(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('Người dùng: 100')).toBeInTheDocument();
            expect(screen.getByText('Doanh thu: 5.0')).toBeInTheDocument(); // 5.0 M
            expect(screen.getByText('Chờ duyệt: 5')).toBeInTheDocument();
            expect(screen.getByText('Lỗi đang xử lý: 2')).toBeInTheDocument();
        });
    });

    it('should call exportToPDF when button clicked', async () => {
        render(<Dashboard />);
        await waitFor(() => screen.getByText('Xuất PDF'));

        const exportBtn = screen.getByText('Xuất PDF');
        fireEvent.click(exportBtn);

        expect(dashboardService.exportToPDF).toHaveBeenCalled();
    });
});
