/**
 * Unit Tests for workflowService.ts
 * Tests workflow management and approval chains
 */

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { workflowService } from '../../services/workflowService';

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
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
}));

describe('workflowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getWorkflows tests
  // ==========================================
  describe('getWorkflows', () => {
    it('should return empty array when no workflows', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (getDocs as jest.Mock).mockResolvedValue({ forEach: jest.fn() });

      const result = await workflowService.getWorkflows();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should return array of workflows', async () => {
      const mockWorkflows = [
        { id: 'w1', name: 'Standard Approval' },
        { id: 'w2', name: 'Express Approval' },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockWorkflows.forEach(w => cb({ id: w.id, data: () => w })),
      });

      const result = await workflowService.getWorkflows();

      expect(result).toHaveLength(2);
    });
  });

  // ==========================================
  // getWorkflow tests
  // ==========================================
  describe('getWorkflow', () => {
    it('should return workflow when found', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'workflow-123',
        data: () => ({ name: 'Test Workflow' }),
      });

      const result = await workflowService.getWorkflow('workflow-123');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test Workflow');
      consoleSpy.mockRestore();
    });

    it('should return null when not found', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      const result = await workflowService.getWorkflow('nonexistent');

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // createWorkflow tests
  // ==========================================
  describe('createWorkflow', () => {
    it('should create workflow with timestamps', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-workflow-123' });

      const workflowData = {
        name: 'New Workflow',
        status: 'active',
        steps: [],
      };

      const result = await workflowService.createWorkflow(workflowData as any);

      expect(result.id).toBe('new-workflow-123');
      expect(addDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // isStepComplete tests (pure function)
  // ==========================================
  describe('isStepComplete', () => {
    it('should return false for no approvals', () => {
      const step = { approvalType: 'any', approverIds: ['a1'], approvals: [] };
      const result = workflowService.isStepComplete(step as any);
      expect(result).toBe(false);
    });

    it('should return true for any with one approval', () => {
      const step = {
        approvalType: 'any',
        approverIds: ['a1', 'a2'],
        approvals: [{ decision: 'approve' }],
      };
      const result = workflowService.isStepComplete(step as any);
      expect(result).toBe(true);
    });

    it('should return true for all with all approvals', () => {
      const step = {
        approvalType: 'all',
        approverIds: ['a1', 'a2'],
        approvals: [{ decision: 'approve' }, { decision: 'approve' }],
      };
      const result = workflowService.isStepComplete(step as any);
      expect(result).toBe(true);
    });

    it('should return true for majority with enough approvals', () => {
      const step = {
        approvalType: 'majority',
        approverIds: ['a1', 'a2', 'a3'],
        approvals: [{ decision: 'approve' }, { decision: 'approve' }],
      };
      const result = workflowService.isStepComplete(step as any);
      expect(result).toBe(true);
    });
  });
});
