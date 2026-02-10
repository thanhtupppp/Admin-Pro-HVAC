/**
 * Unit Tests for brandService.ts
 * Tests brand and model CRUD operations
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
  increment,
} from 'firebase/firestore';
import { brandService } from '../../services/brandService';

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
  increment: jest.fn((n) => n),
}));

describe('brandService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getBrands tests
  // ==========================================
  describe('getBrands', () => {
    it('should return empty array when no brands exist', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: jest.fn(),
      });

      const result = await brandService.getBrands();

      expect(result).toEqual([]);
    });

    it('should return array of brands', async () => {
      const mockBrands = [
        { id: 'brand-1', name: 'Daikin', modelCount: 5 },
        { id: 'brand-2', name: 'Carrier', modelCount: 3 },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          mockBrands.forEach((brand) => {
            callback({
              id: brand.id,
              data: () => ({ name: brand.name, modelCount: brand.modelCount }),
            });
          });
        },
      });

      const result = await brandService.getBrands();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Daikin');
    });
  });

  // ==========================================
  // getModelsByBrand tests
  // ==========================================
  describe('getModelsByBrand', () => {
    it('should return models for specific brand', async () => {
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});

      const mockModels = [
        { id: 'model-1', name: 'FTKC25', brandId: 'brand-1' },
        { id: 'model-2', name: 'FTKC35', brandId: 'brand-1' },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          mockModels.forEach((model) => {
            callback({
              id: model.id,
              data: () => model,
            });
          });
        },
      });

      const result = await brandService.getModelsByBrand('brand-1');

      expect(result).toHaveLength(2);
      expect(where).toHaveBeenCalledWith('brandId', '==', 'brand-1');
    });
  });

  // ==========================================
  // createBrand tests
  // ==========================================
  describe('createBrand', () => {
    it('should create brand with modelCount 0', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-brand-123' });

      const brandData = {
        name: 'LG',
        logo: 'lg-logo.png',
      };

      const result = await brandService.createBrand(brandData);

      expect(result.id).toBe('new-brand-123');
      expect(result.modelCount).toBe(0);
      expect(addDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // updateBrand tests
  // ==========================================
  describe('updateBrand', () => {
    it('should update brand document', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await brandService.updateBrand('brand-123', { name: 'Updated Name' });

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  // ==========================================
  // deleteBrand tests
  // ==========================================
  describe('deleteBrand', () => {
    it('should delete brand document', async () => {
      (doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await brandService.deleteBrand('brand-to-delete');

      expect(deleteDoc).toHaveBeenCalledWith('mock-doc-ref');
    });
  });

  // ==========================================
  // createModel tests
  // ==========================================
  describe('createModel', () => {
    it('should create model and increment brand count', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-model-456' });
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const modelData = {
        name: 'FTKC50',
        brandId: 'brand-1',
        specs: {},
      };

      const result = await brandService.createModel(modelData as any);

      expect(result.id).toBe('new-model-456');
      expect(addDoc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled(); // For incrementing brand count
    });
  });

  // ==========================================
  // deleteModel tests
  // ==========================================
  describe('deleteModel', () => {
    it('should delete model and decrement brand count', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ brandId: 'brand-1', name: 'Model1' }),
      });
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await brandService.deleteModel('model-to-delete');

      expect(deleteDoc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled(); // For decrementing brand count
    });

    it('should log warning when model not found', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      await brandService.deleteModel('nonexistent');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
