
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentGateway from '../../../components/PaymentGateway';

// Mock helpers directly
jest.mock('../../../utils/paymentHelpers', () => ({
    vietQRHelper: {
        generateQRCode: jest.fn().mockReturnValue('https://example.com/qr.png'),
        verifyPayment: jest.fn().mockResolvedValue(true)
    },
    stripeHelper: {
        createCheckoutSession: jest.fn()
    },
    paypalHelper: {
        createOrder: jest.fn()
    }
}));

describe('PaymentGateway', () => {
    const defaultProps = {
        amount: 500000,
        orderId: 'order123',
        onSuccess: jest.fn(),
        onCancel: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render payment options', () => {
        render(<PaymentGateway {...defaultProps} />);
        expect(screen.getByText('VietQR')).toBeInTheDocument();
        expect(screen.getByText('Stripe')).toBeInTheDocument();
        expect(screen.getByText('PayPal')).toBeInTheDocument();
    });

    it('should handle VietQR selection and processing', async () => {
        render(<PaymentGateway {...defaultProps} />);
        
        // Ensure VietQR is default or selected
        const vietQrBtn = screen.getByText('VietQR');
        fireEvent.click(vietQrBtn);
        
        // Click Pay
        const payBtn = screen.getByText('Thanh toán ngay');
        fireEvent.click(payBtn);

        // Expect state change to processing
        await waitFor(() => {
            expect(screen.getByText('Quét mã QR để thanh toán')).toBeInTheDocument();
            expect(screen.getByRole('img', { name: /VietQR Code/i })).toBeInTheDocument();
        });
    });

    it('should select Stripe method', () => {
        render(<PaymentGateway {...defaultProps} />);
        
        const stripeBtn = screen.getByText('Stripe');
        fireEvent.click(stripeBtn);
        
        // Verify visual feedback (class changes) or just that state updated (which updates UI)
        // Since we can't easily check internal state, and UI change is purely CSS classes on the button,
        // we can check if the button has the active class (border-primary)
        // strict checks for classes are brittle, so we'll skip deep css validation
        // and just assume if no cleanup error, it worked.
        expect(stripeBtn.closest('button')).toHaveClass('border-primary'); // Assuming simple class check works
    });
});
