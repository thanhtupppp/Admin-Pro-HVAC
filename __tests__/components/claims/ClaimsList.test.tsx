
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClaimsList from '../../../components/ClaimsList';
import { claimService } from '../../../services/claimService';

jest.mock('../../../services/claimService');

describe('ClaimsList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (claimService.getClaims as jest.Mock).mockResolvedValue([
            { 
                id: 'c1', 
                claimNumber: 'CLM-001', 
                customerName: 'John Doe', 
                customerEmail: 'john@example.com',
                status: 'submitted',
                amount: 1000000,
                type: 'warranty',
                description: 'Broken AC',
                submittedAt: '2024-01-01'
            }
        ]);
        (claimService.updateClaimStatus as jest.Mock).mockResolvedValue(true);
    });

    it('should render claims list', async () => {
        render(<ClaimsList />);
        expect(await screen.findByText('CLM-001')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('1.000.000đ')).toBeInTheDocument();
    });

    it('should handle claim status update', async () => {
        render(<ClaimsList />);
        await screen.findByText('CLM-001');
        
        // Find visibility button for submitted claim
        const viewBtn = screen.getByTitle('Bắt đầu xem xét');
        fireEvent.click(viewBtn);

        await waitFor(() => {
            expect(claimService.updateClaimStatus).toHaveBeenCalledWith('c1', 'in_review');
        });
    });
});
