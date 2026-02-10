/**
 * Unit Tests for systemService.ts
 * Tests system settings, audit logs, and activity tracking
 */

import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { systemService } from '../../services/systemService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  Timestamp: { now: jest.fn() },
}));

jest.mock('papaparse', () => ({
  default: { unparse: jest.fn(() => 'csv-content') },
  unparse: jest.fn(() => 'csv-content'),
}));

describe('systemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getLogs tests
  // ==========================================
  describe('getLogs', () => {
    it('should return array of activity logs', async () => {
      const mockLogs = [
        { id: 'l1', action: 'CREATE', target: 'User', timestamp: '2024-01-01' },
        { id: 'l2', action: 'UPDATE', target: 'Error', timestamp: '2024-01-02' },
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockLogs.forEach(l => cb({ id: l.id, data: () => l })),
      });

      const result = await systemService.getLogs();

      expect(result).toHaveLength(2);
    });
  });

  // ==========================================
  // getSettings tests
  // ==========================================
  describe('getSettings', () => {
    it('should return settings when exists', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ appName: 'Test App', maintenanceMode: false }),
      });

      const result = await systemService.getSettings();

      expect(result.appName).toBe('Test App');
    });

    it('should return defaults when not exists', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      const result = await systemService.getSettings();

      expect(result.appName).toBe('Admin Pro Console');
    });
  });

  // ==========================================
  // updateSettings tests
  // ==========================================
  describe('updateSettings', () => {
    it('should update and return settings', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ appName: 'New' })
      });
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await systemService.updateSettings({ appName: 'New' });

      expect(result.appName).toBe('New');
    });
  });

  // ==========================================
  // checkForUpdates tests
  // ==========================================
  describe('checkForUpdates', () => {
    it('should return version info', async () => {
      const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5); // > 0.3 implies update

      const result = await systemService.checkForUpdates();

      expect(result).toHaveProperty('version');
      expect(result.version).toBe('v3.5.0-beta');
      
      mockRandom.mockRestore();
    });
  });
});
