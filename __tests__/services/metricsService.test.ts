/**
 * Unit Tests for metricsService.ts
 * Tests business metrics and AI usage tracking
 */

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { metricsService } from '../../services/metricsService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  setDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: { now: jest.fn() },
  onSnapshot: jest.fn(() => jest.fn()),
}));

// Mock dependent services
jest.mock('../../services/userService', () => ({
  userService: {
    getUsers: jest.fn().mockResolvedValue([
      { id: 'u1', plan: 'Free' },
      { id: 'u2', plan: 'Premium' },
      { id: 'u3', plan: 'Premium' },
    ]),
  },
}));

jest.mock('../../services/paymentService', () => ({
  paymentService: {
    getTransactions: jest.fn().mockResolvedValue([
      { id: 't1', amount: 500000, status: 'completed' },
      { id: 't2', amount: 199000, status: 'pending' },
    ]),
  },
}));

describe('metricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // calculateMetrics tests
  // ==========================================
  describe('calculateMetrics', () => {
    it('should calculate all metrics correctly', async () => {
      const result = await metricsService.calculateMetrics();

      expect(result.totalUsersCount).toBe(3);
      expect(result.premiumUsersCount).toBe(2);
      expect(result.conversionRate).toBeCloseTo(66.67, 1);
      expect(result.totalRevenue).toBe(500000);
      expect(result.pendingTransactions).toBe(1);
    });
  });

  // ==========================================
  // formatCurrency tests (pure function)
  // ==========================================
  describe('formatCurrency', () => {
    it('should format billions', () => {
      const result = metricsService.formatCurrency(1_500_000_000);
      expect(result).toBe('1.5 B');
    });

    it('should format millions', () => {
      const result = metricsService.formatCurrency(2_500_000);
      expect(result).toBe('2.5 M');
    });

    it('should format thousands', () => {
      const result = metricsService.formatCurrency(5_500);
      expect(result).toBe('5.5 K');
    });

    it('should format small numbers', () => {
      const result = metricsService.formatCurrency(500);
      expect(result).toBe('500');
    });
  });

  // ==========================================
  // formatPercentage tests (pure function)
  // ==========================================
  describe('formatPercentage', () => {
    it('should format percentage with one decimal', () => {
      const result = metricsService.formatPercentage(66.666);
      expect(result).toBe('66.7% ');
    });
  });

  // ==========================================
  // resetMonthlyMetrics tests
  // ==========================================
  describe('resetMonthlyMetrics', () => {
    it('should reset all metrics to zero', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await metricsService.resetMonthlyMetrics();

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          requestsUsed: 0,
          tokensInput: 0,
          tokensOutput: 0,
        })
      );
      consoleSpy.mockRestore();
    });
  });
});
