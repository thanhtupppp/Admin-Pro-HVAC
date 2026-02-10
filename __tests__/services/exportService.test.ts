/**
 * Unit Tests for exportService.ts
 * Tests CSV/JSON export functionality
 */

import { exportService } from '../../services/exportService';

// Mock PapaParse
jest.mock('papaparse', () => ({
  unparse: jest.fn((data) => 'csv-content'),
}));

// Mock dependent services
jest.mock('../../services/userService', () => ({
  userService: {
    getUsers: jest.fn().mockResolvedValue([
      { id: 'u1', email: 'user1@test.com' },
      { id: 'u2', email: 'user2@test.com' },
    ]),
  },
}));

jest.mock('../../services/paymentService', () => ({
  paymentService: {
    getTransactions: jest.fn().mockResolvedValue([{ id: 't1', amount: 100000 }]),
  },
}));

jest.mock('../../services/errorService', () => ({
  errorService: {
    getErrors: jest.fn().mockResolvedValue([{ id: 'e1', code: 'E01' }]),
  },
}));

jest.mock('../../services/planService', () => ({
  planService: {
    getPlans: jest.fn().mockResolvedValue([{ id: 'p1', name: 'Premium' }]),
  },
}));

jest.mock('../../services/brandService', () => ({
  brandService: {
    getBrands: jest.fn().mockResolvedValue([{ id: 'b1', name: 'Daikin' }]),
  },
}));

// Mock DOM APIs
const mockCreateElement = jest.fn(() => ({
  href: '',
  download: '',
  click: jest.fn(),
}));
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockCreateObjectURL = jest.fn(() => 'blob:url');
const mockRevokeObjectURL = jest.fn();

// Mock URL and Blob which might be missing or need mocking
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;
global.Blob = class Blob {
  constructor(public content: any[], public options: any) {}
} as any;

describe('exportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportUsers', () => {
    it('should export users and return success', async () => {
      const result = await exportService.exportUsers();

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });
  });

  describe('exportTransactions', () => {
    it('should export transactions and return success', async () => {
      const result = await exportService.exportTransactions();

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });
  });

  describe('exportErrorCodes', () => {
    it('should export error codes and return success', async () => {
      const result = await exportService.exportErrorCodes();

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });
  });

  describe('exportPlans', () => {
    it('should export plans and return success', async () => {
      const result = await exportService.exportPlans();

      expect(result.success).toBe(true);
    });
  });

  describe('fullBackup', () => {
    it('should create full backup with all data', async () => {
      const result = await exportService.fullBackup();

      expect(result.success).toBe(true);
      expect(result.stats).toHaveProperty('usersCount');
      expect(result.stats).toHaveProperty('transactionsCount');
    });
  });
});
