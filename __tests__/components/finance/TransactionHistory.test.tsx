
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionHistory from '../../../components/TransactionHistory';
import { paymentService } from '../../../services/paymentService';
import { Transaction } from '../../../types';

jest.mock('../../../services/paymentService');

describe('TransactionHistory', () => {
    const mockTxns = [
        { id: 't1', amount: 100000, status: 'pending', createdAt: '2024-01-01', description: 'Test', userId: 'u1', paymentMethod: 'vietqr' },
        { id: 't2', amount: 200000, status: 'completed', createdAt: '2024-01-02', description: 'Test 2', userId: 'u2', paymentMethod: 'bank_transfer' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (paymentService.getTransactions as jest.Mock).mockResolvedValue(mockTxns);
        (paymentService.updateTransactionStatus as jest.Mock).mockResolvedValue(true);
        window.confirm = jest.fn(() => true);
    });

    it('should load and render transactions', async () => {
        render(<TransactionHistory />);
        
        await waitFor(() => {
            // Amount is formatted as toLocaleString('vi-VN') VNĐ
            expect(screen.getByText(/100\.000/)).toBeInTheDocument();
            expect(screen.getByText(/200\.000/)).toBeInTheDocument();
        });
    });

    it('should handle approval', async () => {
        render(<TransactionHistory />);
        
        await waitFor(() => {
            expect(screen.getByText(/100\.000/)).toBeInTheDocument();
        });

        // Find the "Duyệt" button (only pending items have it)
        const approveBtn = screen.getByText('Duyệt');
        fireEvent.click(approveBtn);

        await waitFor(() => {
            expect(paymentService.updateTransactionStatus).toHaveBeenCalledWith('t1', 'completed');
        });
    });
});
