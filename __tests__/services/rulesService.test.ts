/**
 * Unit Tests for rulesService.ts
 * Tests claim rules CRUD and evaluation logic
 */

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { rulesService } from '../../services/rulesService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
}));

describe('rulesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getRules tests
  // ==========================================
  describe('getRules', () => {
    it('should return empty array when no rules', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({ forEach: jest.fn() });

      const result = await rulesService.getRules();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should return array of rules', async () => {
      const mockRules = [
        { id: 'r1', name: 'Auto Approve', priority: 1 },
        { id: 'r2', name: 'Manual Review', priority: 2 },
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockRules.forEach(r => cb({ id: r.id, data: () => r })),
      });

      const result = await rulesService.getRules();

      expect(result).toHaveLength(2);
    });
  });

  // ==========================================
  // createRule tests
  // ==========================================
  describe('createRule', () => {
    it('should create rule with timestamps', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-rule-123' });

      const ruleData = {
        name: 'New Rule',
        priority: 1,
        status: 'active' as const,
        conditions: [],
        actions: [],
      };

      const result = await rulesService.createRule(ruleData as any);

      expect(result.id).toBe('new-rule-123');
      expect(addDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // deleteRule tests
  // ==========================================
  describe('deleteRule', () => {
    it('should delete rule', async () => {
      (doc as jest.Mock).mockReturnValue('mock-ref');
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await rulesService.deleteRule('rule-to-delete');

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // evaluateCondition tests (pure function)
  // ==========================================
  describe('evaluateCondition', () => {
    const mockClaim = {
      amount: 500000,
      type: 'warranty',
      category: 'parts',
    };

    it('should evaluate equals correctly', () => {
      const condition = { field: 'type', operator: 'equals', value: 'warranty' };
      const result = rulesService.evaluateCondition(mockClaim as any, condition as any);
      expect(result).toBe(true);
    });

    it('should evaluate greater_than correctly', () => {
      const condition = { field: 'amount', operator: 'greater_than', value: 100000 };
      const result = rulesService.evaluateCondition(mockClaim as any, condition as any);
      expect(result).toBe(true);
    });

    it('should evaluate less_than correctly', () => {
      const condition = { field: 'amount', operator: 'less_than', value: 1000000 };
      const result = rulesService.evaluateCondition(mockClaim as any, condition as any);
      expect(result).toBe(true);
    });

    it('should evaluate contains correctly', () => {
      const condition = { field: 'category', operator: 'contains', value: 'part' };
      const result = rulesService.evaluateCondition(mockClaim as any, condition as any);
      expect(result).toBe(true);
    });
  });

  // ==========================================
  // evaluateConditions tests
  // ==========================================
  describe('evaluateConditions', () => {
    it('should return true for empty conditions', () => {
      const result = rulesService.evaluateConditions({} as any, []);
      expect(result).toBe(true);
    });

    it('should evaluate AND logic correctly', () => {
      const claim = { amount: 500000, type: 'warranty' };
      const conditions = [
        { field: 'amount', operator: 'greater_than', value: 100000, logicOperator: 'AND' },
        { field: 'type', operator: 'equals', value: 'warranty' },
      ];

      const result = rulesService.evaluateConditions(claim as any, conditions as any);
      expect(result).toBe(true);
    });
  });
});
