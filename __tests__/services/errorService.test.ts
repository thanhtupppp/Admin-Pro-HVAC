/**
 * Unit Tests for errorService.ts
 * Tests HVAC error code CRUD operations
 */

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { errorService } from '../../services/errorService';

// Mock Firebase
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
  increment: jest.fn((n) => n),
}));

// Mock dependent services
jest.mock('../../services/systemService', () => ({
  systemService: {
    logActivity: jest.fn(),
  },
}));

jest.mock('../../services/brandService', () => ({
  brandService: {
    getBrands: jest.fn().mockResolvedValue([]),
    createBrand: jest.fn(),
    getModelsByBrand: jest.fn().mockResolvedValue([]),
    createModel: jest.fn(),
  },
}));

describe('errorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getErrors tests
  // ==========================================
  describe('getErrors', () => {
    it('should return array of error codes', async () => {
      const mockErrors = [
        { id: 'e1', code: 'E01', title: 'Low Pressure', brand: 'Daikin' },
        { id: 'e2', code: 'E02', title: 'High Pressure', brand: 'Carrier' },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockErrors.forEach(e => cb({ id: e.id, data: () => e })),
      });

      const result = await errorService.getErrors();

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('E01');
    });
  });

  // ==========================================
  // getErrorById tests
  // ==========================================
  describe('getErrorById', () => {
    it('should return error when found', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'error-123',
        data: () => ({ code: 'E01', title: 'Test Error', updatedAt: '2024-01-01' }),
      });

      const result = await errorService.getErrorById('error-123');

      expect(result).not.toBeUndefined();
      expect(result?.code).toBe('E01');
    });

    it('should return undefined when not found', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      const result = await errorService.getErrorById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  // ==========================================
  // createError tests
  // ==========================================
  describe('createError', () => {
    it('should create error with timestamp', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-error-123' });

      const errorData = {
        code: 'E99',
        title: 'New Error Code',
        description: 'Test description',
        brand: 'Daikin',
        model: 'FTKC25',
        solution: 'Reset the unit',
      };

      const result = await errorService.createError(errorData as any);

      expect(result.id).toBe('new-error-123');
      expect(addDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // incrementViews tests
  // ==========================================
  describe('incrementViews', () => {
    it('should increment view count', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await errorService.incrementViews('error-123');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ views: expect.anything() })
      );
      consoleSpy.mockRestore();
    });
  });
});
