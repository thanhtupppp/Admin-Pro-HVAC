
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClaimsAnalytics from '../../../components/ClaimsAnalytics';
import { claimService } from '../../../services/claimService';
import { ClaimsStats, ClaimTimeline } from '../../../types/claim';

jest.mock('../../../services/claimService');

describe('ClaimsAnalytics', () => {
    const mockStats: ClaimsStats = {
        total: 100,
        totalAmount: 50000000,
        averageAmount: 500000,
        approvalRate: 80,
        autoApprovalRate: 30,
        averageProcessingTime: 24,
        byStatus: {
            draft: 5,
            submitted: 10,
            in_review: 15,
            pending_approval: 20,
            approved: 40,
            rejected: 5,
            cancelled: 5
        },
        byType: {
            warranty: 60,
            exchange: 20,
            return: 10,
            repair: 10
        }
    };

    const mockTimeline: ClaimTimeline[] = [
        { date: '2024-01-01', count: 5, amount: 1000000 },
        { date: '2024-01-02', count: 8, amount: 2000000 }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (claimService.getClaimsStats as jest.Mock).mockResolvedValue(mockStats);
        (claimService.getClaimsTimeline as jest.Mock).mockResolvedValue(mockTimeline);
    });

    it('should render analytics stats', async () => {
        render(<ClaimsAnalytics />);
        expect(await screen.findByText('100')).toBeInTheDocument(); // Total claims
        expect(screen.getByText('50.0M')).toBeInTheDocument(); // Total amount
        expect(screen.getByText('80.0%')).toBeInTheDocument(); // Approval rate
    });

    it('should render status distribution', async () => {
        render(<ClaimsAnalytics />);
        await waitFor(() => {
            expect(screen.getByText('Phân bố theo trạng thái')).toBeInTheDocument();
            expect(screen.getByText('Đã duyệt')).toBeInTheDocument();
        });
    });
});
