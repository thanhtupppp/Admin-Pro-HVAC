
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CouponManager from '../../../components/CouponManager';
import { couponService } from '../../../services/couponService';

jest.mock('../../../services/couponService');

describe('CouponManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (couponService.getCoupons as jest.Mock).mockResolvedValue([
            { 
                id: 'c1', 
                code: 'TEST10', 
                discountType: 'percent', 
                discountValue: 10, 
                status: 'active',
                validFrom: '2024-01-01',
                validTo: '2024-12-31',
                usedCount: 5,
                usageLimit: 100
            }
        ]);
    });

    it('should render coupons', async () => {
        render(<CouponManager />);
        await waitFor(() => {
            expect(screen.getByText('TEST10')).toBeInTheDocument();
            expect(screen.getByText('-10%')).toBeInTheDocument();
        });
    });

    it('should open modal on create click', async () => {
        render(<CouponManager />);
        await waitFor(() => screen.getByText('TEST10'));
        
        fireEvent.click(screen.getByText('Tạo mã mới'));
        expect(screen.getByText('Tạo mã giảm giá mới')).toBeInTheDocument();
    });
});
