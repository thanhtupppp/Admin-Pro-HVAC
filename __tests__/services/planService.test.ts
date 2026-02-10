/**
 * Unit Tests for planService.ts
 * Tests subscription plan CRUD operations
 */

import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
} from 'firebase/firestore';
import { planService, Plan } from '../../services/planService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(() => ({ id: 'mock-id' })),
  query: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: { now: jest.fn() },
}));

describe('planService', () => {
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

      const result = await planService.getPlans();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should return plans sorted by price', async () => {
      const mockPlans = [
        { id: 'p1', name: 'Premium', price: 500000 },
        { id: 'p2', name: 'Free', price: 0 },
        { id: 'p3', name: 'Basic', price: 200000 },
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockPlans.forEach(p => cb({ id: p.id, data: () => p })),
      });

      const result = await planService.getPlans();

      expect(result).toHaveLength(3);
      expect(result[0].price).toBe(0); // Free should be first
      expect(result[2].price).toBe(500000); // Premium should be last
    });
  });

  // ==========================================
  // getPlan tests
  // ==========================================
  describe('getPlan', () => {
    it('should return plan when found', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'plan-123',
        data: () => ({ name: 'Premium', price: 500000 }),
      });

      const result = await planService.getPlan('plan-123');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Premium');
      consoleSpy.mockRestore();
    });

    it('should return null when not found', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      const result = await planService.getPlan('nonexistent');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // createPlan tests
  // ==========================================
  describe('createPlan', () => {
    it('should create plan with timestamps', async () => {
      (doc as jest.Mock).mockReturnValue({ id: 'new-plan-456' });
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const planData = {
        name: 'Pro',
        displayName: 'Gói Pro',
        price: 300000,
        billingCycle: 'monthly' as const,
        tier: 'Premium' as const,
        description: 'Best for professionals',
        features: ['Feature A', 'Feature B'],
        status: 'active' as const,
      };

      const result = await planService.createPlan(planData);

      expect(result.id).toBe('new-plan-456');
      expect(setDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // updatePlan tests
  // ==========================================
  describe('updatePlan', () => {
    it('should update plan and return updated data', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      (getDoc as jest.Mock).mockResolvedValue({
        id: 'plan-123',
        data: () => ({ name: 'Updated Plan', price: 600000 }),
      });

      const result = await planService.updatePlan('plan-123', { price: 600000 });

      expect(updateDoc).toHaveBeenCalled();
      expect(result.price).toBe(600000);
    });
  });

  // ==========================================
  // deletePlan tests
  // ==========================================
  describe('deletePlan', () => {
    it('should delete plan document', async () => {
      (doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await planService.deletePlan('plan-to-delete');

      expect(deleteDoc).toHaveBeenCalledWith('mock-doc-ref');
    });
  });
});
