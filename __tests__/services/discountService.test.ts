/**
 * Unit Tests for discountService.ts
 * Tests discount code CRUD and validation
 */

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  increment,
} from 'firebase/firestore';
import { discountService } from '../../services/discountService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => true, id: 'code-123', data: () => ({}) })),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  increment: jest.fn((n) => n),
}));

describe('discountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getAllCodes tests
  // ==========================================
  describe('getAllCodes', () => {
    it('should return empty array when no codes', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

      const result = await discountService.getAllCodes();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should return array of codes', async () => {
      const mockCodes = [
        { id: 'd1', code: 'SAVE10', value: 10 },
        { id: 'd2', code: 'SAVE20', value: 20 },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockCodes.map(c => ({ id: c.id, data: () => c })),
      });

      const result = await discountService.getAllCodes();

      expect(result).toHaveLength(2);
    });
  });

  // ==========================================
  // createCode tests
  // ==========================================
  describe('createCode', () => {
    it('should create code with uppercase', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-code-123' });

      const codeData = {
        code: 'summer2024',
        name: 'Summer Sale 2024',
        description: 'Summer discount campaign',
        type: 'percentage' as const,
        value: 15,
        status: 'active' as const,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        createdBy: 'admin-1',
      };

      const result = await discountService.createCode(codeData);

      expect(result.code).toBe('SUMMER2024');
      expect(result.usedCount).toBe(0);
      expect(addDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // updateCode tests
  // ==========================================
  describe('updateCode', () => {
    it('should update code with timestamp', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await discountService.updateCode('code-123', { status: 'expired' });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'expired', updatedAt: expect.any(String) })
      );
    });
  });

  // ==========================================
  // deleteCode tests
  // ==========================================
  describe('deleteCode', () => {
    it('should delete code document', async () => {
      (doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await discountService.deleteCode('code-to-delete');

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // getActiveCodes tests
  // ==========================================
  describe('getActiveCodes', () => {
    it('should return only active and valid codes', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const mockCodes = [
        { id: 'd1', code: 'ACTIVE1', status: 'active', validTo: futureDate.toISOString() },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockCodes.map(c => ({ id: c.id, data: () => c })),
      });

      const result = await discountService.getActiveCodes();

      expect(result).toHaveLength(1);
      consoleSpy.mockRestore();
    });
  });
});
