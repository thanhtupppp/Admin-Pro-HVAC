/**
 * Unit Tests for fraudService.ts
 * Tests fraud detection and analysis
 */

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { fraudService } from '../../services/fraudService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
}));

describe('fraudService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // calculateSeverity tests (pure function)
  // ==========================================
  describe('calculateSeverity', () => {
    it('should return critical for score >= 90', () => {
      const result = fraudService.calculateSeverity(95);
      expect(result).toBe('critical');
    });

    it('should return high for score >= 70', () => {
      const result = fraudService.calculateSeverity(75);
      expect(result).toBe('high');
    });

    it('should return medium for score >= 40', () => {
      const result = fraudService.calculateSeverity(50);
      expect(result).toBe('medium');
    });

    it('should return low for score < 40', () => {
      const result = fraudService.calculateSeverity(20);
      expect(result).toBe('low');
    });
  });

  // ==========================================
  // calculateSimilarity tests (pure function)
  // ==========================================
  describe('calculateSimilarity', () => {
    it('should calculate similarity between claims', () => {
      const claim1 = {
        amount: 500000,
        type: 'warranty',
        category: 'parts',
        description: 'AC not cooling',
      };
      const claim2 = {
        amount: 500000,
        type: 'warranty',
        category: 'parts',
        description: 'AC not cooling properly',
      };

      const result = fraudService.calculateSimilarity(claim1 as any, claim2 as any);

      expect(result).toBeGreaterThan(0.5);
    });
  });

  // ==========================================
  // textSimilarity tests (pure function)
  // ==========================================
  describe('textSimilarity', () => {
    it('should return 1 for identical strings', () => {
      const result = fraudService.textSimilarity('hello world', 'hello world');
      expect(result).toBe(1);
    });

    it('should return 0 for completely different strings', () => {
      const result = fraudService.textSimilarity('abc', 'xyz');
      expect(result).toBe(0);
    });

    it('should return partial similarity', () => {
      const result = fraudService.textSimilarity('hello world', 'hello');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  // ==========================================
  // getAlerts tests
  // ==========================================
  describe('getAlerts', () => {
    it('should return alerts from Firestore', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockAlerts = [
        { id: 'a1', claimId: 'c1', riskScore: 85 },
        { id: 'a2', claimId: 'c2', riskScore: 60 },
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockAlerts.forEach(a => cb({ id: a.id, data: () => a })),
      });

      const result = await fraudService.getAlerts();

      expect(result).toHaveLength(2);
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // createAlert tests
  // ==========================================
  describe('createAlert', () => {
    it('should create fraud alert', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'alert-123' });

      const result = await fraudService.createAlert(
        'claim-1',
        'CLM-001',
        'duplicate',
        85,
        [{ type: 'duplicate', description: 'Duplicate claim detected' }] as any
      );

      expect(result.id).toBe('alert-123');
      expect(addDoc).toHaveBeenCalled();
    });
  });
});
