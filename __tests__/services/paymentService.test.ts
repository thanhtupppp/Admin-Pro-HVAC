/**
 * Unit Tests for paymentService.ts
 * Tests transaction and payment operations
 */

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  getDoc,
  doc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { paymentService } from '../../services/paymentService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  Timestamp: { now: jest.fn() },
}));

// Mock related services
jest.mock('../../services/emailService', () => ({
  emailService: {
    sendWelcomeEmail: jest.fn(),
    sendPaymentSuccess: jest.fn(),
    sendPlanActivated: jest.fn(),
  },
}));

jest.mock('../../services/planService', () => ({
  planService: {
    getPlans: jest.fn().mockResolvedValue([]),
    getPlan: jest.fn(),
  },
}));

describe('paymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getPlans tests
  // ==========================================
  describe('getPlans', () => {
    it('should return empty array when no plans', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({ forEach: jest.fn() });

      const result = await paymentService.getPlans();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // createTransaction tests
  // ==========================================
  describe('createTransaction', () => {
    it('should create transaction with timestamps', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'txn-123' });

      const txnData = {
        userId: 'user-1',
        planId: 'premium',
        amount: 500000,
        status: 'pending' as const,
        paymentMethod: 'bank_transfer',
      };

      const result = await paymentService.createTransaction(txnData as any);

      expect(result.id).toBe('txn-123');
      expect(addDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // getTransactions tests
  // ==========================================
  describe('getTransactions', () => {
    it('should return array of transactions', async () => {
      const mockTransactions = [
        { id: 't1', userId: 'u1', amount: 100000, status: 'completed' },
        { id: 't2', userId: 'u2', amount: 200000, status: 'pending' },
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockTransactions.forEach(t => cb({ id: t.id, data: () => t })),
      });

      const result = await paymentService.getTransactions();

      expect(result).toHaveLength(2);
    });
  });

  // ==========================================
  // getTransactionsByStatus tests
  // ==========================================
  describe('getTransactionsByStatus', () => {
    it('should filter transactions by status', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      
      const mockTransactions = [
        { id: 't1', status: 'pending', amount: 100000 },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockTransactions.forEach(t => cb({ id: t.id, data: () => t })),
      });

      const result = await paymentService.getTransactionsByStatus('pending');

      expect(where).toHaveBeenCalledWith('status', '==', 'pending');
      expect(result).toHaveLength(1);
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // updateTransactionStatus tests
  // ==========================================
  describe('updateTransactionStatus', () => {
    it('should update transaction status', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ id: 'txn-123', status: 'pending' })
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await paymentService.updateTransactionStatus('txn-123', 'completed');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'completed' })
      );
    });
  });
});
