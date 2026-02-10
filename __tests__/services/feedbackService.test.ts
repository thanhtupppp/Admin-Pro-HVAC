/**
 * Unit Tests for feedbackService.ts
 * Tests user feedback CRUD and admin replies
 */

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { feedbackService } from '../../services/feedbackService';

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
  where: jest.fn(),
}));

describe('feedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getFeedbacks tests
  // ==========================================
  describe('getFeedbacks', () => {
    it('should return empty array when no feedbacks', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({ forEach: jest.fn() });

      const result = await feedbackService.getFeedbacks();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should return array of feedbacks', async () => {
      const mockFeedbacks = [
        { id: 'f1', title: 'Bug report', status: 'pending' },
        { id: 'f2', title: 'Feature request', status: 'resolved' },
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockFeedbacks.forEach(f => cb({ id: f.id, data: () => f })),
      });

      const result = await feedbackService.getFeedbacks();

      expect(result).toHaveLength(2);
    });
  });

  // ==========================================
  // getUserFeedbacks tests
  // ==========================================
  describe('getUserFeedbacks', () => {
    it('should return feedbacks for specific user', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});

      const mockFeedbacks = [
        { id: 'f1', userId: 'user-123', title: 'My feedback' },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockFeedbacks.forEach(f => cb({ id: f.id, data: () => f })),
      });

      const result = await feedbackService.getUserFeedbacks('user-123');

      expect(result).toHaveLength(1);
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // createFeedback tests
  // ==========================================
  describe('createFeedback', () => {
    it('should create feedback with pending status', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'feedback-123' });

      const feedbackData = {
        userId: 'user-1',
        userName: 'Test User',
        userEmail: 'test@example.com',
        title: 'Need help',
        content: 'My AC is not cooling',
        category: 'support',
      };

      const result = await feedbackService.createFeedback(feedbackData as any);

      expect(result.id).toBe('feedback-123');
      expect(result.status).toBe('pending');
    });
  });

  // ==========================================
  // replyFeedback tests
  // ==========================================
  describe('replyFeedback', () => {
    it('should update feedback with admin reply', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await feedbackService.replyFeedback('feedback-123', 'Thank you for your feedback', 'resolved', 'Admin');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          adminReply: 'Thank you for your feedback',
          status: 'resolved',
          replyBy: 'Admin',
        })
      );
      consoleSpy.mockRestore();
    });
  });
});
