/**
 * Unit Tests for tagService.ts
 * Tests document tag CRUD and statistics
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
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { tagService } from '../../services/tagService';

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
  increment: jest.fn((n) => n),
  arrayUnion: jest.fn((val) => val),
  arrayRemove: jest.fn((val) => val),
}));

describe('tagService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getAllTags tests
  // ==========================================
  describe('getAllTags', () => {
    it('should return empty array when no tags', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (getDocs as jest.Mock).mockResolvedValue({ docs: [] });

      const result = await tagService.getAllTags();

      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should return array of tags', async () => {
      const mockTags = [
        { id: 't1', name: 'Important', color: 'red', count: 5 },
        { id: 't2', name: 'Archive', color: 'gray', count: 10 },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockTags.map(t => ({ id: t.id, data: () => t })),
      });

      const result = await tagService.getAllTags();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Important');
    });
  });

  // ==========================================
  // createTag tests
  // ==========================================
  describe('createTag', () => {
    it('should create tag with count 0', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-tag-123' });

      const tagData = {
        name: 'Urgent',
        color: '#ff0000',
        description: 'Urgent documents',
        createdBy: 'admin-1',
      };

      const result = await tagService.createTag(tagData);

      expect(result.id).toBe('new-tag-123');
      expect(result.count).toBe(0);
      expect(addDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // updateTag tests
  // ==========================================
  describe('updateTag', () => {
    it('should update tag with timestamp', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await tagService.updateTag('tag-123', { name: 'Updated Name' });

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ name: 'Updated Name', updatedAt: expect.any(String) })
      );
    });
  });

  // ==========================================
  // addTagToDocument tests
  // ==========================================
  describe('addTagToDocument', () => {
    it('should add tag and increment count', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await tagService.addTagToDocument('doc-1', 'tag-1');

      // Should call updateDoc twice: once for document, once for tag count
      expect(updateDoc).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================
  // removeTagFromDocument tests
  // ==========================================
  describe('removeTagFromDocument', () => {
    it('should remove tag and decrement count', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await tagService.removeTagFromDocument('doc-1', 'tag-1');

      expect(updateDoc).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================
  // getDocumentsByTag tests
  // ==========================================
  describe('getDocumentsByTag', () => {
    it('should return documents with specific tag', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});

      const mockDocs = [
        { id: 'doc-1', title: 'Document 1', tags: ['tag-1'] },
        { id: 'doc-2', title: 'Document 2', tags: ['tag-1'] },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockDocs.map(d => ({ id: d.id, data: () => d })),
      });

      const result = await tagService.getDocumentsByTag('tag-1');

      expect(result).toHaveLength(2);
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // getPopularTags tests
  // ==========================================
  describe('getPopularTags', () => {
    it('should return tags sorted by count descending', async () => {
      const mockTags = [
        { id: 't1', name: 'Low', count: 2, createdAt: '2024-01-01' },
        { id: 't2', name: 'High', count: 100, createdAt: '2024-01-02' },
        { id: 't3', name: 'Medium', count: 50, createdAt: '2024-01-03' },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockTags.map(t => ({ id: t.id, data: () => t })),
      });

      const result = await tagService.getPopularTags(2);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('High');
      expect(result[1].name).toBe('Medium');
    });
  });
});
