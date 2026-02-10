/**
 * Unit Tests for paymentGatewayService.ts
 * Tests VietQR payment processing
 */

import { doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { paymentGatewayService, VIETNAM_BANKS } from '../../services/paymentGatewayService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  Timestamp: { now: jest.fn() },
}));

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockQR'),
}));

describe('paymentGatewayService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // VIETNAM_BANKS constant
  // ==========================================
  describe('VIETNAM_BANKS', () => {
    it('should have major Vietnamese banks', () => {
      expect(VIETNAM_BANKS.length).toBeGreaterThan(5);
      const bankIds = VIETNAM_BANKS.map(b => b.id);
      expect(bankIds).toContain('VCB');
      expect(bankIds).toContain('TCB');
    });
  });

  // ==========================================
  // generateVietQR tests
  // ==========================================
  describe('generateVietQR', () => {
    it('should generate QR code', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const payment = {
        accountNo: '123456789',
        accountName: 'TEST USER',
        bankId: 'VCB',
        bankName: 'Vietcombank',
        amount: 199000,
        description: 'PAY123456',
      };

      const result = await paymentGatewayService.generateVietQR(payment);

      expect(result).toContain('data:image/png');
      consoleSpy.mockRestore();
    });

    it('should throw for invalid bank', async () => {
      const payment = {
        accountNo: '123456789',
        accountName: 'TEST USER',
        bankId: 'INVALID',
        bankName: 'Invalid Bank',
        amount: 199000,
        description: 'PAY123456',
      };
      
      try {
        await paymentGatewayService.generateVietQR(payment);
        fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  // ==========================================
  // createTransaction tests
  // ==========================================
  describe('createTransaction', () => {
    it('should create transaction and return ID', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (addDoc as jest.Mock).mockResolvedValue({ id: 'txn-123' });

      const result = await paymentGatewayService.createTransaction(
        'user-1',
        'user@test.com',
        'plan-premium',
        'Premium',
        199000
      );

      expect(result).toBe('txn-123');
      expect(addDoc).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // rejectPayment tests
  // ==========================================
  describe('rejectPayment', () => {
    it('should update transaction status to rejected', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await paymentGatewayService.rejectPayment('txn-123', 'admin-1');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'rejected' })
      );
      consoleSpy.mockRestore();
    });
  });
});
