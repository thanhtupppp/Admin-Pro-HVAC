
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApprovalInterface from '../../../components/ApprovalInterface';
import { claimService } from '../../../services/claimService';
import { workflowService } from '../../../services/workflowService';

jest.mock('../../../services/claimService');
jest.mock('../../../services/workflowService');

describe('ApprovalInterface', () => {
    const mockClaims = [
        { id: 'c1', claimNumber: 'CLM-001', customerName: 'Alice', amount: 500000 }
    ];

    const mockChain = {
        id: 'chain1',
        steps: [
            { stepNumber: 1, stepName: 'Review', status: 'in_progress', approvals: [] }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (claimService.getPendingApprovals as jest.Mock).mockResolvedValue(mockClaims);
        (workflowService.getApprovalChain as jest.Mock).mockResolvedValue(mockChain);
        (claimService.updateClaimStatus as jest.Mock).mockResolvedValue(true);
        (workflowService.submitApproval as jest.Mock).mockResolvedValue(true);
    });

    it('should render pending claims', async () => {
        render(<ApprovalInterface />);
        expect(await screen.findByText('CLM-001')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should handle approval selection', async () => {
        render(<ApprovalInterface />);
        const claimBtn = await screen.findByText('CLM-001');
        fireEvent.click(claimBtn);

        await waitFor(() => {
            expect(workflowService.getApprovalChain).toHaveBeenCalledWith('c1');
            expect(screen.getByText('Quy trình phê duyệt')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Phê duyệt'));
        
        await waitFor(() => {
            expect(workflowService.submitApproval).toHaveBeenCalled();
            expect(claimService.updateClaimStatus).toHaveBeenCalledWith('c1', 'approved');
        });
    });
});
