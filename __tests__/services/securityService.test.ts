/**
 * Unit Tests for securityService.ts
 * Tests suspicious activity tracking and user unlocking
 */

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { securityService } from '../../services/securityService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

describe('securityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getSuspiciousActivities tests
  // ==========================================
  describe('getSuspiciousActivities', () => {
    it('should return violation logs', async () => {
      const mockActivities = [
        { id: 'v1', userId: 'u1', reason: 'Screenshot', type: 'screenshot' },
        { id: 'v2', userId: 'u2', reason: 'Root detected', type: 'root' },
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockActivities.map(a => ({ id: a.id, data: () => a })),
      });

      const result = await securityService.getSuspiciousActivities();

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('screenshot');
    });

    it('should respect limit parameter', async () => {
      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

      await securityService.getSuspiciousActivities(10);

      expect(limit).toHaveBeenCalledWith(10);
    });
  });

  // ==========================================
  // unlockUser tests
  // ==========================================
  describe('unlockUser', () => {
    it('should update user status to active', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await securityService.unlockUser('user-123');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'active', lockReason: null })
      );
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // resolveSuspiciousActivity tests
  // ==========================================
  describe('resolveSuspiciousActivity', () => {
    it('should mark activity as resolved', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await securityService.resolveSuspiciousActivity('activity-123');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ resolved: true })
      );
      consoleSpy.mockRestore();
    });
  });
});
