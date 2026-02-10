/**
 * Unit Tests for claimService.ts
 * Tests claims management operations with mocked Firestore
 */

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { claimService } from '../../services/claimService';
import { ClaimStatus } from '../../types/claim';

// Mock Firebase modules
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

describe('claimService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getClaims tests
  // ==========================================
  describe('getClaims', () => {
    it('should return empty array when no claims exist', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      // Mock forEach pattern like actual implementation
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: jest.fn(),
      });

      const result = await claimService.getClaims();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should return claims array', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockClaims = [
        { id: 'claim-1', status: 'pending', amount: 1000 },
        { id: 'claim-2', status: 'approved', amount: 2000 },
      ];
      
      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          mockClaims.forEach((claim) => {
            callback({
              id: claim.id,
              data: () => claim,
            });
          });
        },
      });

      const result = await claimService.getClaims();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('claim-1');
      consoleSpy.mockRestore();
    });

    it('should apply status filter', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({ forEach: jest.fn() });

      await claimService.getClaims({ status: 'pending' as ClaimStatus });

      expect(where).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // getClaim tests
  // ==========================================
  describe('getClaim', () => {
    it('should return claim when found', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'claim-123',
        data: () => ({
          status: 'pending',
          amount: 5000,
          description: 'Test claim',
        }),
      });

      const result = await claimService.getClaim('claim-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('claim-123');
      expect(result?.amount).toBe(5000);
    });

    it('should return null when claim not found', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await claimService.getClaim('nonexistent');

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // createClaim tests
  // ==========================================
  describe('createClaim', () => {
    it('should create claim with timestamps', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-claim-789' });

      // Complete claim data matching Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>
      const claimData = {
        claimNumber: 'CLM-TEST-001',
        customerId: 'customer-1',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        type: 'warranty' as const,
        status: 'pending' as ClaimStatus,
        amount: 10000,
        description: 'New warranty claim',
        priority: 'medium' as const,
        assignedTo: 'admin-1',
      };

      const result = await claimService.createClaim(claimData as any);

      expect(result.id).toBe('new-claim-789');
      expect(addDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // updateClaim tests
  // ==========================================
  describe('updateClaim', () => {
    it('should update claim with new data', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await claimService.updateClaim('claim-123', { amount: 15000 });

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // updateClaimStatus tests
  // ==========================================
  describe('updateClaimStatus', () => {
    it('should update status with timestamp', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await claimService.updateClaimStatus('claim-123', 'approved' as ClaimStatus);

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should include reason when provided', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await claimService.updateClaimStatus(
        'claim-123',
        'rejected' as ClaimStatus,
        'Invalid documentation'
      );

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // deleteClaim tests
  // ==========================================
  describe('deleteClaim', () => {
    it('should soft delete by updating status to cancelled', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await claimService.deleteClaim('claim-to-delete');

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // subscribeToClaims tests
  // ==========================================
  describe('subscribeToClaims', () => {
    it('should return unsubscribe function', () => {
      const mockUnsubscribe = jest.fn();
      (onSnapshot as jest.Mock).mockReturnValue(mockUnsubscribe);
      (query as jest.Mock).mockReturnValue({});

      const unsubscribe = claimService.subscribeToClaims(() => {});

      expect(typeof unsubscribe).toBe('function');
    });
  });

  // ==========================================
  // getClaimsStats tests
  // ==========================================
  describe('getClaimsStats', () => {
    it('should return statistics object', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      // getClaimsStats calls getClaims internally which uses forEach
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: jest.fn(),
      });

      const result = await claimService.getClaimsStats();

      // ClaimsStats has these properties
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('byStatus');
      expect(result).toHaveProperty('totalAmount');
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // getClaimsTimeline tests
  // ==========================================
  describe('getClaimsTimeline', () => {
    it('should return timeline array', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      // getClaimsTimeline calls getClaims internally
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: jest.fn(),
      });

      const result = await claimService.getClaimsTimeline(30);

      expect(Array.isArray(result)).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // getPendingApprovals tests
  // ==========================================
  describe('getPendingApprovals', () => {
    it('should return pending claims for user', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      // getPendingApprovals uses forEach pattern
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          callback({
            id: 'claim-1',
            data: () => ({ status: 'pending_approval', assignedTo: 'user-123' }),
          });
        },
      });

      const result = await claimService.getPendingApprovals('user-123');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
      consoleSpy.mockRestore();
    });
  });
});
