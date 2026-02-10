/**
 * Unit Tests for importService.ts
 * Tests CSV parsing and data import
 */

import { importService } from '../../services/importService';

// Mock DOM methods for download template tests
Object.defineProperty(document, 'body', {
  value: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
  writable: true
});

// Mock PapaParse
jest.mock('papaparse', () => ({
  parse: jest.fn((file, config) => {
    config.complete({ data: [{ email: 'test@test.com', username: 'test' }] });
  }),
}));

// Mock dependent services
jest.mock('../../services/userService', () => ({
  userService: {
    createUser: jest.fn().mockResolvedValue({ id: 'new-user-123' }),
    getUsers: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../services/errorService', () => ({
  errorService: {
    createError: jest.fn().mockResolvedValue({ id: 'new-error-123' }),
    getErrors: jest.fn().mockResolvedValue([]),
  },
}));

// URL mock for blob handling
global.URL.createObjectURL = jest.fn(() => 'blob:url');
global.URL.revokeObjectURL = jest.fn();

describe('importService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(document, 'createElement').mockImplementation(() => ({
      href: '',
      download: '',
      click: jest.fn(),
    } as any));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================
  // downloadUserTemplate tests
  // ==========================================
  describe('downloadUserTemplate', () => {
    it('should create download link', () => {
      importService.downloadUserTemplate();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });

  // ==========================================
  // downloadErrorTemplate tests
  // ==========================================
  describe('downloadErrorTemplate', () => {
    it('should create download link', () => {
      importService.downloadErrorTemplate();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });

  // ==========================================
  // downloadModelTemplate tests
  // ==========================================
  describe('downloadModelTemplate', () => {
    it('should create download link', () => {
      importService.downloadModelTemplate();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });
});
