/**
 * Unit Tests for dashboardService.ts
 * Tests real-time stats and trend calculations
 */

import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { dashboardService, DashboardStats } from '../../services/dashboardService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: {
    now: jest.fn(),
  },
}));

// Mock window for exportToPDF
const mockOpen = jest.fn();
global.open = mockOpen;
global.alert = jest.fn();

describe('dashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getStatsRealtime tests
  // ==========================================
  describe('getStatsRealtime', () => {
    it('should return unsubscribe function', () => {
      const mockUnsubscribe = jest.fn();
      (onSnapshot as jest.Mock).mockReturnValue(mockUnsubscribe);

      const callback = jest.fn();
      const unsubscribe = dashboardService.getStatsRealtime(callback);

      expect(typeof unsubscribe).toBe('function');
      // Should set up 4 listeners (users, transactions completed, pending, errors)
      expect(onSnapshot).toHaveBeenCalledTimes(4);
    });

    it('should call callback with stats on snapshot update', () => {
      // Setup mocks to immediately call snapshot callback
      (onSnapshot as jest.Mock).mockImplementation((_, onSuccess) => {
        onSuccess({ size: 10, docs: [] });
        return jest.fn();
      });

      const callback = jest.fn();
      dashboardService.getStatsRealtime(callback);

      expect(callback).toHaveBeenCalled();
      // Should receive stats object
      const receivedStats = callback.mock.calls[0][0];
      expect(receivedStats).toHaveProperty('totalUsers');
      expect(receivedStats).toHaveProperty('totalRevenue');
      expect(receivedStats).toHaveProperty('pendingApprovals');
      expect(receivedStats).toHaveProperty('activeErrors');
    });

    it('should unsubscribe from all listeners when called', () => {
      const mockUnsub1 = jest.fn();
      const mockUnsub2 = jest.fn();
      const mockUnsub3 = jest.fn();
      const mockUnsub4 = jest.fn();

      let callCount = 0;
      (onSnapshot as jest.Mock).mockImplementation(() => {
        callCount++;
        switch (callCount) {
          case 1: return mockUnsub1;
          case 2: return mockUnsub2;
          case 3: return mockUnsub3;
          case 4: return mockUnsub4;
          default: return jest.fn();
        }
      });

      const unsubscribe = dashboardService.getStatsRealtime(() => {});
      unsubscribe();

      expect(mockUnsub1).toHaveBeenCalled();
      expect(mockUnsub2).toHaveBeenCalled();
      expect(mockUnsub3).toHaveBeenCalled();
      expect(mockUnsub4).toHaveBeenCalled();
    });
  });

  // ==========================================
  // calculateTrend tests
  // ==========================================
  describe('calculateTrend', () => {
    it('should return 100 when previous is 0 and current > 0', () => {
      const result = dashboardService.calculateTrend(50, 0);
      expect(result).toBe(100);
    });

    it('should return 0 when both are 0', () => {
      const result = dashboardService.calculateTrend(0, 0);
      expect(result).toBe(0);
    });

    it('should calculate positive trend correctly', () => {
      // 150 is 50% more than 100
      const result = dashboardService.calculateTrend(150, 100);
      expect(result).toBe(50);
    });

    it('should calculate negative trend correctly', () => {
      // 50 is 50% less than 100
      const result = dashboardService.calculateTrend(50, 100);
      expect(result).toBe(-50);
    });

    it('should handle decimal results', () => {
      // 110 is 10% more than 100
      const result = dashboardService.calculateTrend(110, 100);
      expect(result).toBe(10);
    });
  });

  // ==========================================
  // exportToPDF tests
  // ==========================================
  describe('exportToPDF', () => {
    it('should open new window with PDF content', async () => {
      const mockDocument = {
        write: jest.fn(),
        close: jest.fn(),
      };
      mockOpen.mockReturnValue({
        document: mockDocument,
        focus: jest.fn(),
        print: jest.fn(),
      });

      const stats: DashboardStats = {
        totalUsers: 100,
        totalRevenue: 5000000,
        pendingApprovals: 5,
        activeErrors: 2,
        trends: { users: 10, revenue: 20, approvals: -5, errors: 0 },
      };

      // Just call the function and expect mockOpen to be called.
      // We skip resolving the internal promise/timeout perfectly to avoid test hang
      try {
        await dashboardService.exportToPDF(stats);
      } catch (e) {
        // ignore timeout/error
      }

      expect(mockOpen).toHaveBeenCalled();
    });

    it('should alert when popup blocked', async () => {
      mockOpen.mockReturnValue(null);
      const alertMock = jest.fn();
      global.alert = alertMock;

      const stats: DashboardStats = {
        totalUsers: 100,
        totalRevenue: 5000000,
        pendingApprovals: 5,
        activeErrors: 2,
        trends: { users: 10, revenue: 20, approvals: -5, errors: 0 },
      };

      await dashboardService.exportToPDF(stats);

      expect(alertMock).toHaveBeenCalled();
    });
  });
});
