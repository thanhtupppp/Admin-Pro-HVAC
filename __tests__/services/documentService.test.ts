/**
 * Unit Tests for documentService.ts
 * Tests document upload and management
 */

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
} from 'firebase/firestore';
import { documentService } from '../../services/documentService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: { now: jest.fn() },
  updateDoc: jest.fn(),
}));

describe('documentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // addDocument tests
  // ==========================================
  describe('addDocument', () => {
    it('should add document with timestamp', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'doc-123' });

      const docData = {
        title: 'Service Manual',
        brand: 'Daikin',
        model_series: 'FTKC',
        fileId: 'file-123',
        previewUrl: 'https://example.com/preview.pdf',
        type: 'manual' as const,
      };

      const result = await documentService.addDocument(docData);

      expect(result).toBe('doc-123');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (addDoc as jest.Mock).mockRejectedValue(new Error('Add failed'));

      await expect(documentService.addDocument({} as any)).rejects.toThrow('Add failed');
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // getDocuments tests
  // ==========================================
  describe('getDocuments', () => {
    it('should return empty array when no documents', async () => {
      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({ forEach: jest.fn() });

      const result = await documentService.getDocuments();

      expect(result).toEqual([]);
    });

    it('should return documents sorted by date', async () => {
      const mockDocs = [
        { id: 'd1', title: 'Old Doc', createdAt: '2024-01-01' },
        { id: 'd2', title: 'New Doc', createdAt: '2024-06-01' },
      ];

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (cb: Function) => mockDocs.forEach(d => cb({ id: d.id, data: () => d })),
      });

      const result = await documentService.getDocuments();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('New Doc'); // Newer first
    });
  });

  // ==========================================
  // deleteDocument tests
  // ==========================================
  describe('deleteDocument', () => {
    it('should delete document', async () => {
      (doc as jest.Mock).mockReturnValue('mock-ref');
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await documentService.deleteDocument('doc-to-delete');

      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (deleteDoc as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(documentService.deleteDocument('doc-123')).rejects.toThrow('Delete failed');
      consoleSpy.mockRestore();
    });
  });
});
