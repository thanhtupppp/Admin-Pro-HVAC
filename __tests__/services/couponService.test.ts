/**
 * Unit Tests for couponService.ts
 * Tests coupon CRUD and validation logic
 */

import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { couponService } from '../../services/couponService';

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
  doc: jest.fn(() => ({ id: 'mock-id' })),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
}));

describe('couponService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getCoupons tests
  // ==========================================
  describe('getCoupons', () => {
    it('should return empty array when no coupons', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({ forEach: jest.fn() });

      const result = await couponService.getCoupons();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should return array of coupons', async () => {
      const mockCoupons = [
        { id: 'c1', code: 'SAVE10', discountValue: 10 },
        { id: 'c2', code: 'SAVE20', discountValue: 20 },
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockCoupons.forEach(c => cb({ id: c.id, data: () => c })),
      });

      const result = await couponService.getCoupons();

      expect(result).toHaveLength(2);
    });
  });

  // ==========================================
  // getCouponByCode tests
  // ==========================================
  describe('getCouponByCode', () => {
    it('should return coupon when found', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [{ id: 'coupon-1', data: () => ({ code: 'SAVE10' }) }],
      });

      const result = await couponService.getCouponByCode('save10');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('SAVE10');
      consoleSpy.mockRestore();
    });

    it('should return null when not found', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });

      const result = await couponService.getCouponByCode('INVALID');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // createCoupon tests
  // ==========================================
  describe('createCoupon', () => {
    it('should create coupon with uppercase code', async () => {
      (doc as jest.Mock).mockReturnValue({ id: 'new-coupon-123' });
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const couponData = {
        code: 'summer2024',
        discountType: 'percent' as const,
        discountValue: 15,
        status: 'active' as const,
        usageLimit: 100,
        usedCount: 0,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
      };

      const result = await couponService.createCoupon(couponData);

      expect(result.code).toBe('SUMMER2024');
      expect(setDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // deleteCoupon tests
  // ==========================================
  describe('deleteCoupon', () => {
    it('should soft delete by setting status to disabled', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await couponService.deleteCoupon('coupon-to-delete');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'disabled' })
      );
    });
  });

  // ==========================================
  // calculateDiscount tests (pure function)
  // ==========================================
  describe('calculateDiscount', () => {
    it('should calculate percent discount correctly', () => {
      const coupon = {
        discountType: 'percent' as const,
        discountValue: 20,
      };

      const result = couponService.calculateDiscount(100000, coupon as any);

      expect(result).toBe(80000); // 100000 - 20%
    });

    it('should calculate fixed discount correctly', () => {
      const coupon = {
        discountType: 'fixed' as const,
        discountValue: 50000,
      };

      const result = couponService.calculateDiscount(200000, coupon as any);

      expect(result).toBe(150000);
    });

    it('should not go below 0', () => {
      const coupon = {
        discountType: 'fixed' as const,
        discountValue: 100000,
      };

      const result = couponService.calculateDiscount(50000, coupon as any);

      expect(result).toBe(0);
    });
  });
});
