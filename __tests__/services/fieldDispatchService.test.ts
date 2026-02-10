/**
 * Unit Tests for fieldDispatchService.ts
 * Tests technician job management
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
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { fieldDispatchService } from '../../services/fieldDispatchService';

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
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  Timestamp: { now: jest.fn() },
}));

describe('fieldDispatchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getJobs tests
  // ==========================================
  describe('getJobs', () => {
    it('should return jobs', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockJobs = [
        { id: 'j1', customerName: 'Customer 1', status: 'scheduled' },
        { id: 'j2', customerName: 'Customer 2', status: 'in_progress' },
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockJobs.map(j => ({ id: j.id, data: () => j })),
      });

      const result = await fieldDispatchService.getJobs();

      expect(result).toHaveLength(2);
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // addJob tests
  // ==========================================
  describe('addJob', () => {
    it('should add job and return ID', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (addDoc as jest.Mock).mockResolvedValue({ id: 'job-123' });

      const jobData = {
        customerId: 'c1',
        customerName: 'Test Customer',
        customerPhone: '0123456789',
        address: '123 Test Street',
        technicianId: 't1',
        technicianName: 'Tech 1',
        status: 'scheduled' as const,
        estimatedDuration: 60,
        notes: '',
        priority: 'medium' as const,
      };

      const result = await fieldDispatchService.addJob(jobData as any);

      expect(result).toBe('job-123');
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // updateJobStatus tests
  // ==========================================
  describe('updateJobStatus', () => {
    it('should update job status', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await fieldDispatchService.updateJobStatus('job-123', 'completed');

      expect(updateDoc).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // deleteJob tests
  // ==========================================
  describe('deleteJob', () => {
    it('should delete job', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await fieldDispatchService.deleteJob('job-123');

      expect(deleteDoc).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
