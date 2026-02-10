
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiscountManager from '../../../components/DiscountManager';
import { discountService } from '../../../services/discountService';

jest.mock('../../../services/discountService');

describe('DiscountManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (discountService.getAllCodes as jest.Mock).mockResolvedValue([
            { 
                id: 'd1', 
                code: 'DISC20', 
                name: 'Discount 20',
                type: 'percentage', 
                value: 20, 
                status: 'active',
                validFrom: '2024-01-01',
                validTo: '2024-12-31',
                usedCount: 2,
                createdAt: '2024-01-01'
            }
        ]);
    });

    it('should render discount codes', async () => {
        render(<DiscountManager />);
        await waitFor(() => {
            expect(screen.getByText('DISC20')).toBeInTheDocument();
            expect(screen.getByText('20%')).toBeInTheDocument();
        });
    });
});
