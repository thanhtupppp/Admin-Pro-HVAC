/**
 * Unit Tests for videoService.ts
 * Tests YouTube video management
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
import { videoService } from '../../services/videoService';

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
  Timestamp: { now: jest.fn() },
  increment: jest.fn((n) => n),
}));

// Mock fetch
global.fetch = jest.fn();

describe('videoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // extractVideoId tests (pure function)
  // ==========================================
  describe('extractVideoId', () => {
    it('should extract ID from youtube.com/watch?v=', () => {
      const result = videoService.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from youtu.be/', () => {
      const result = videoService.extractVideoId('https://youtu.be/dQw4w9WgXcQ');
      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from youtube.com/embed/', () => {
      const result = videoService.extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
      const result = videoService.extractVideoId('https://invalid.com/video');
      expect(result).toBeNull();
    });
  });

  // ==========================================
  // getVideos tests
  // ==========================================
  describe('getVideos', () => {
    it('should return videos', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockVideos = [
        { id: 'v1', title: 'Tutorial 1' },
        { id: 'v2', title: 'Tutorial 2' },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockVideos.map(v => ({ id: v.id, data: () => v })),
      });

      const result = await videoService.getVideos();

      expect(result).toHaveLength(2);
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // addVideo tests
  // ==========================================
  describe('addVideo', () => {
    it('should add video and return ID', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (addDoc as jest.Mock).mockResolvedValue({ id: 'video-123' });

      const videoData = {
        title: 'New Tutorial',
        description: 'Learn HVAC',
        youtubeUrl: 'https://youtube.com/watch?v=abc123',
        videoId: 'abc123',
        thumbnailUrl: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg',
        duration: 300,
        errorCodes: ['E01'],
        tags: ['hvac'],
        uploadedBy: 'admin',
        status: 'active' as const,
      };

      const result = await videoService.addVideo(videoData as any);

      expect(result).toBe('video-123');
      consoleSpy.mockRestore();
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

      await videoService.incrementViews('video-123');

      expect(updateDoc).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // toggleLike tests
  // ==========================================
  describe('toggleLike', () => {
    it('should increment likes when shouldIncrement is true', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await videoService.toggleLike('video-123', true);

      expect(updateDoc).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
