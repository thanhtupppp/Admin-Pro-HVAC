/**
 * Unit Tests for bankSettingsService.ts
 * Tests VietQR bank configuration
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { bankSettingsService } from '../../services/bankSettingsService';

// Mock Firebase
jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
}));

describe('bankSettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getBankSettings tests
  // ==========================================
  describe('getBankSettings', () => {
    it('should return settings when exists', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'vietqr_config',
        data: () => ({ bankId: 'VCB', accountNumber: '123456' }),
      });

      const result = await bankSettingsService.getBankSettings();

      expect(result?.bankId).toBe('VCB');
      consoleSpy.mockRestore();
    });

    it('should return defaults when not exists', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      const result = await bankSettingsService.getBankSettings();

      expect(result?.bankId).toBe('ICB');
      expect(result?.bankName).toBe('VietinBank');
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // getSupportedBanks tests (pure function)
  // ==========================================
  describe('getSupportedBanks', () => {
    it('should return list of banks', () => {
      const banks = bankSettingsService.getSupportedBanks();

      expect(banks.length).toBeGreaterThan(50);
      expect(banks[0]).toHaveProperty('id');
      expect(banks[0]).toHaveProperty('name');
    });

    it('should include major Vietnamese banks', () => {
      const banks = bankSettingsService.getSupportedBanks();
      const bankIds = banks.map(b => b.id);

      expect(bankIds).toContain('VCB');
      expect(bankIds).toContain('TCB');
      expect(bankIds).toContain('MB');
    });
  });

  // ==========================================
  // updateBankSettings tests
  // ==========================================
  describe('updateBankSettings', () => {
    it('should update settings', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await bankSettingsService.updateBankSettings(
        { bankId: 'VCB', bankName: 'Vietcombank', accountNumber: '999999', accountName: 'Test', template: 'compact2', isActive: true, updatedBy: 'admin' },
        'admin-1'
      );

      expect(setDoc).toHaveBeenCalled();
    });
  });
});
