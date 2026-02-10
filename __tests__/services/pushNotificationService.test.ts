/**
 * Unit Tests for pushNotificationService.ts
 * Tests FCM push notification sending
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { pushNotificationService } from '../../services/pushNotificationService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
  app: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
  httpsCallable: jest.fn(() => jest.fn().mockResolvedValue({ data: { success: true, successCount: 1, failureCount: 0 } })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('pushNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getTargetTokens tests
  // ==========================================
  describe('getTargetTokens', () => {
    it('should return empty array for invalid target', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await pushNotificationService.getTargetTokens('user' as any, undefined);

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should return tokens for all users', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockUsers = [
        { fcmToken: 'token1' },
        { fcmToken: 'token2' },
        { }, // user without token
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockUsers.forEach(u => cb({ data: () => u })),
      });

      const result = await pushNotificationService.getTargetTokens('all');

      expect(result).toHaveLength(2);
      expect(result).toContain('token1');
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // saveToHistory tests
  // ==========================================
  describe('saveToHistory', () => {
    it('should save notification to history', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (addDoc as jest.Mock).mockResolvedValue({ id: 'history-1' });

      await pushNotificationService.saveToHistory({
        title: 'Test Notification',
        body: 'Test body',
        targetType: 'all',
      } as any);

      expect(addDoc).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
