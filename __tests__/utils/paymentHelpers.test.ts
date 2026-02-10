/**
 * Unit Tests for paymentHelpers.ts
 * Testing VietQR, Stripe, PayPal helpers
 */

import { vietQRHelper, stripeHelper, paypalHelper } from '../../utils/paymentHelpers';

describe('paymentHelpers', () => {

  // ==========================================
  // vietQRHelper tests
  // ==========================================
  describe('vietQRHelper', () => {
    describe('generateQRCode', () => {
      it('should generate valid VietQR URL', () => {
        const url = vietQRHelper.generateQRCode('ORDER123', 100000);
        
        expect(url).toContain('https://img.vietqr.io/image/');
        expect(url).toContain('amount=100000');
        expect(url).toContain('ADMINPRO%20ORDER123');
      });

      it('should include bank and account info', () => {
        const url = vietQRHelper.generateQRCode('TEST', 50000);
        
        expect(url).toContain('970422'); // Bank ID
        expect(url).toContain('0123456789'); // Account number
        expect(url).toContain('compact2'); // Template
      });

      it('should encode special characters in orderId', () => {
        const url = vietQRHelper.generateQRCode('ORDER 123 & TEST', 100000);
        
        // Should be URL encoded
        expect(url).toContain(encodeURIComponent('ADMINPRO ORDER 123 & TEST'));
      });

      it('should handle zero amount', () => {
        const url = vietQRHelper.generateQRCode('ORDER', 0);
        expect(url).toContain('amount=0');
      });

      it('should handle large amounts', () => {
        const url = vietQRHelper.generateQRCode('ORDER', 999999999);
        expect(url).toContain('amount=999999999');
      });
    });

    describe('verifyPayment', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should return boolean after delay', async () => {
        const promise = vietQRHelper.verifyPayment('ORDER123', 100000);
        
        jest.advanceTimersByTime(2000);
        
        const result = await promise;
        expect(typeof result).toBe('boolean');
      });

      it('should resolve within expected time', async () => {
        const promise = vietQRHelper.verifyPayment('ORDER123', 100000);
        
        // Should not resolve immediately
        let resolved = false;
        promise.then(() => { resolved = true; });
        
        await Promise.resolve(); // Flush microtasks
        expect(resolved).toBe(false);
        
        // Should resolve after 2 seconds
        jest.advanceTimersByTime(2000);
        const result = await promise;
        expect(typeof result).toBe('boolean');
      });
    });
  });

  // ==========================================
  // stripeHelper tests
  // ==========================================
  describe('stripeHelper', () => {
    describe('createCheckoutSession', () => {
      it('should return Stripe checkout URL', async () => {
        const url = await stripeHelper.createCheckoutSession('ORDER123', 100000);
        
        expect(url).toContain('https://checkout.stripe.com');
        expect(url).toContain('ORDER123');
        expect(url).toContain('100000');
      });

      it('should include order ID in URL', async () => {
        const url = await stripeHelper.createCheckoutSession('MY-ORDER-456', 50000);
        expect(url).toContain('MY-ORDER-456');
      });
    });

    describe('handleWebhook', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      afterEach(() => {
        consoleSpy.mockClear();
      });

      it('should log webhook event', async () => {
        const event = { type: 'checkout.session.completed', data: {} };
        await stripeHelper.handleWebhook(event);
        
        expect(consoleSpy).toHaveBeenCalledWith('Stripe webhook received:', event);
      });
    });
  });

  // ==========================================
  // paypalHelper tests
  // ==========================================
  describe('paypalHelper', () => {
    describe('createOrder', () => {
      it('should return PayPal checkout URL', async () => {
        const url = await paypalHelper.createOrder('ORDER123', 100000);
        
        expect(url).toContain('https://www.paypal.com');
        expect(url).toContain('ORDER123');
      });

      it('should include amount in URL', async () => {
        const url = await paypalHelper.createOrder('ORDER', 250000);
        expect(url).toContain('250000');
      });
    });

    describe('capturePayment', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      afterEach(() => {
        consoleSpy.mockClear();
      });

      it('should log capture attempt', async () => {
        await paypalHelper.capturePayment('PAYPAL-ORDER-123');
        
        expect(consoleSpy).toHaveBeenCalledWith('Capturing PayPal payment:', 'PAYPAL-ORDER-123');
      });
    });
  });

  // Note: invoiceHelper tests moved to invoiceHelpers.test.ts
  // because they require complex window.open mocking
});
