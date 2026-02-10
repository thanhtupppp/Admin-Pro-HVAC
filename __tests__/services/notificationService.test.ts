/**
 * Unit Tests for notificationService.ts
 * Tests notification management and conversion
 */

import { notificationService } from '../../services/notificationService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()), // Returns unsubscribe function
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    key: jest.fn(),
    length: 0,
  };
})();

Object.defineProperty(global, 'localStorage', { 
  value: localStorageMock,
  writable: true 
});

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  // ==========================================
  // getReadIds tests
  // ==========================================
  describe('getReadIds', () => {
    it('should return empty array when no stored IDs', () => {
      const result = notificationService.getReadIds();
      expect(result).toEqual([]);
    });

    it('should return stored read IDs', () => {
      localStorageMock.setItem('admin_read_notifications', JSON.stringify(['id1', 'id2']));

      const result = notificationService.getReadIds();

      expect(result).toEqual(['id1', 'id2']);
    });
  });

  // ==========================================
  // markAsRead tests
  // ==========================================
  describe('markAsRead', () => {
    it('should add IDs to read list', () => {
      notificationService.markAsRead(['id1', 'id2']);

      const stored = localStorageMock.getItem('admin_read_notifications');
      expect(JSON.parse(stored!)).toContain('id1');
      expect(JSON.parse(stored!)).toContain('id2');
    });

    it('should not duplicate IDs', () => {
      notificationService.markAsRead(['id1']);
      notificationService.markAsRead(['id1', 'id2']);

      const stored = JSON.parse(localStorageMock.getItem('admin_read_notifications')!);
      const id1Count = stored.filter((id: string) => id === 'id1').length;
      expect(id1Count).toBe(1);
    });
  });

  // ==========================================
  // activityToNotification tests
  // ==========================================
  describe('activityToNotification', () => {
    it('should convert user activity to notification', () => {
      const activity = {
        id: 'act-1',
        action: 'CREATE',
        target: 'User',
        userName: 'Admin',
        details: 'Created new user',
        timestamp: '2024-01-01T00:00:00Z',
        severity: 'info',
      };

      const result = notificationService.activityToNotification(activity as any);

      expect(result.type).toBe('user');
      expect(result.title).toBe('User mới');
    });

    it('should convert error activity to notification', () => {
      const activity = {
        id: 'act-2',
        action: 'CREATE',
        target: 'Error Code',
        userName: 'Admin',
        details: 'Added E01',
        timestamp: '2024-01-01T00:00:00Z',
        severity: 'info',
      };

      const result = notificationService.activityToNotification(activity as any);

      expect(result.type).toBe('error');
      expect(result.title).toBe('Mã lỗi mới');
    });

    it('should mark as read if ID is in readIds', () => {
      const activity = {
        id: 'act-3',
        action: 'UPDATE',
        target: 'System',
        userName: 'Admin',
        details: 'System update',
        timestamp: '2024-01-01T00:00:00Z',
        severity: 'info',
      };

      const result = notificationService.activityToNotification(activity as any, ['act-3']);

      expect(result.read).toBe(true);
    });
  });

  // ==========================================
  // transactionToNotification tests
  // ==========================================
  describe('transactionToNotification', () => {
    it('should convert pending transaction to notification', () => {
      const tx = {
        id: 'tx-1',
        userId: 'user-1',
        userEmail: 'user@test.com',
        amount: 500000,
        planName: 'Premium',
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const result = notificationService.transactionToNotification(tx);

      expect(result.type).toBe('warning');
      expect(result.title).toBe('Thanh toán mới');
      expect(result.read).toBe(false);
    });

    it('should mark completed transaction as read', () => {
      const tx = {
        id: 'tx-2',
        userId: 'user-1',
        amount: 500000,
        status: 'completed',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const result = notificationService.transactionToNotification(tx);

      expect(result.read).toBe(true);
    });
  });

  // ==========================================
  // feedbackToNotification tests
  // ==========================================
  describe('feedbackToNotification', () => {
    it('should convert feedback to notification', () => {
      const feedback = {
        id: 'fb-1',
        userName: 'Test User',
        title: 'Help needed',
        content: 'My AC is not working properly and I need assistance with the error code...',
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const result = notificationService.feedbackToNotification(feedback);

      expect(result.type).toBe('warning');
      expect(result.title).toBe('Yêu cầu hỗ trợ mới');
      expect(result.read).toBe(false);
    });
  });
});
