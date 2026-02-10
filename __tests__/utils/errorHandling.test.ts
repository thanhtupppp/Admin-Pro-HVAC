/**
 * Unit Tests for errorHandling.ts
 * Testing error handling utilities
 */

import {
  AppError,
  ErrorCodes,
  handleFirebaseError,
  retryOperation,
  validateRequired,
  safeJSONParse,
  formatErrorForLogging,
  isRetryableError
} from '../../utils/errorHandling';

describe('errorHandling utilities', () => {

  // ==========================================
  // AppError class tests
  // ==========================================
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError('Test message', 'test-code', 400);
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('test-code');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
    });

    it('should use default statusCode 500', () => {
      const error = new AppError('Test', 'code');
      expect(error.statusCode).toBe(500);
    });

    it('should be instance of Error', () => {
      const error = new AppError('Test', 'code');
      expect(error instanceof Error).toBe(true);
    });
  });

  // ==========================================
  // ErrorCodes tests
  // ==========================================
  describe('ErrorCodes', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCodes.PERMISSION_DENIED).toBe('permission-denied');
      expect(ErrorCodes.NOT_FOUND).toBe('not-found');
      expect(ErrorCodes.ALREADY_EXISTS).toBe('already-exists');
      expect(ErrorCodes.NETWORK_ERROR).toBe('network-error');
      expect(ErrorCodes.INVALID_INPUT).toBe('invalid-input');
      expect(ErrorCodes.MISSING_REQUIRED).toBe('missing-required');
      expect(ErrorCodes.INSUFFICIENT_BALANCE).toBe('insufficient-balance');
      expect(ErrorCodes.DUPLICATE_ENTRY).toBe('duplicate-entry');
      expect(ErrorCodes.RULE_VIOLATION).toBe('rule-violation');
    });
  });

  // ==========================================
  // handleFirebaseError tests
  // ==========================================
  describe('handleFirebaseError', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    afterEach(() => {
      consoleSpy.mockClear();
    });

    it('should return Vietnamese message for permission-denied', () => {
      const error = { code: 'permission-denied' };
      expect(handleFirebaseError(error)).toBe('Bạn không có quyền thực hiện thao tác này');
    });

    it('should return Vietnamese message for not-found', () => {
      const error = { code: 'not-found' };
      expect(handleFirebaseError(error)).toBe('Không tìm thấy dữ liệu yêu cầu');
    });

    it('should return Vietnamese message for already-exists', () => {
      const error = { code: 'already-exists' };
      expect(handleFirebaseError(error)).toBe('Dữ liệu đã tồn tại');
    });

    it('should return connection error for unavailable', () => {
      const error = { code: 'unavailable' };
      expect(handleFirebaseError(error)).toBe('Không thể kết nối đến server. Vui lòng thử lại');
    });

    it('should return connection error for deadline-exceeded', () => {
      const error = { code: 'deadline-exceeded' };
      expect(handleFirebaseError(error)).toBe('Không thể kết nối đến server. Vui lòng thử lại');
    });

    it('should return validation error for invalid-argument', () => {
      const error = { code: 'invalid-argument' };
      expect(handleFirebaseError(error)).toBe('Dữ liệu đầu vào không hợp lệ');
    });

    it('should return quota error for resource-exhausted', () => {
      const error = { code: 'resource-exhausted' };
      expect(handleFirebaseError(error)).toBe('Đã vượt quá giới hạn. Vui lòng thử lại sau');
    });

    it('should return error message for unknown code', () => {
      const error = { code: 'unknown-code', message: 'Custom message' };
      expect(handleFirebaseError(error)).toBe('Custom message');
    });

    it('should return generic error for no code and no message', () => {
      const error = {};
      expect(handleFirebaseError(error)).toBe('Đã xảy ra lỗi không xác định');
    });
  });

  // ==========================================
  // retryOperation tests
  // ==========================================
  describe('retryOperation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return result on first success', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await retryOperation(operation);
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on transient error', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ code: 'unavailable' })
        .mockResolvedValue('success');

      const promise = retryOperation(operation, 3, 100);
      
      // Advance timers for retry delay
      await jest.advanceTimersByTimeAsync(100);
      
      const result = await promise;
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on permission-denied', async () => {
      const operation = jest.fn().mockRejectedValue({ code: 'permission-denied' });

      await expect(retryOperation(operation)).rejects.toEqual({ code: 'permission-denied' });
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should not retry on not-found', async () => {
      const operation = jest.fn().mockRejectedValue({ code: 'not-found' });

      await expect(retryOperation(operation)).rejects.toEqual({ code: 'not-found' });
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should not retry on invalid-argument', async () => {
      const operation = jest.fn().mockRejectedValue({ code: 'invalid-argument' });

      await expect(retryOperation(operation)).rejects.toEqual({ code: 'invalid-argument' });
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should throw last error after max retries', async () => {
      jest.useRealTimers(); // Use real timers for this test
      
      const error = { code: 'unavailable', message: 'Service unavailable' };
      let callCount = 0;
      const operation = jest.fn().mockImplementation(() => {
        callCount++;
        return Promise.reject(error);
      });

      await expect(retryOperation(operation, 3, 10)).rejects.toEqual(error);
      expect(callCount).toBe(3);
    });
  });

  // ==========================================
  // validateRequired tests
  // ==========================================
  describe('validateRequired', () => {
    it('should not throw for all required fields present', () => {
      const data = { name: 'John', email: 'john@example.com', age: 25 };
      expect(() => validateRequired(data, ['name', 'email'])).not.toThrow();
    });

    it('should throw AppError for missing fields', () => {
      const data = { name: 'John' };
      expect(() => validateRequired(data, ['name', 'email'])).toThrow(AppError);
    });

    it('should include missing field names in error message', () => {
      const data = { name: 'John' };
      try {
        validateRequired(data, ['name', 'email', 'phone']);
        fail('Should have thrown');
      } catch (error) {
        expect((error as AppError).message).toContain('email');
        expect((error as AppError).message).toContain('phone');
      }
    });

    it('should use correct error code', () => {
      const data = {};
      try {
        validateRequired(data, ['name']);
        fail('Should have thrown');
      } catch (error) {
        expect((error as AppError).code).toBe(ErrorCodes.MISSING_REQUIRED);
      }
    });

    it('should have 400 status code', () => {
      const data = {};
      try {
        validateRequired(data, ['name']);
        fail('Should have thrown');
      } catch (error) {
        expect((error as AppError).statusCode).toBe(400);
      }
    });
  });

  // ==========================================
  // safeJSONParse tests
  // ==========================================
  describe('safeJSONParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJSONParse('{"name": "test"}', {});
      expect(result).toEqual({ name: 'test' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJSONParse('invalid json', fallback);
      expect(result).toBe(fallback);
    });

    it('should return fallback for empty string', () => {
      const fallback: string[] = [];
      const result = safeJSONParse('', fallback);
      expect(result).toBe(fallback);
    });

    it('should handle arrays', () => {
      const result = safeJSONParse('[1, 2, 3]', []);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  // ==========================================
  // formatErrorForLogging tests
  // ==========================================
  describe('formatErrorForLogging', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-02-06T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format error with all properties', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      // @ts-expect-error testing code property
      error.code = 'TEST_CODE';

      const result = formatErrorForLogging(error);

      expect(result.message).toBe('Test error');
      expect(result.code).toBe('TEST_CODE');
      expect(result.stack).toBe('Error stack trace');
      expect(result.timestamp).toBe('2026-02-06T12:00:00.000Z');
    });

    it('should handle missing properties', () => {
      const result = formatErrorForLogging({});
      expect(result.message).toBeUndefined();
      expect(result.code).toBeUndefined();
      expect(result.timestamp).toBe('2026-02-06T12:00:00.000Z');
    });
  });

  // ==========================================
  // isRetryableError tests
  // ==========================================
  describe('isRetryableError', () => {
    it('should return true for retryable errors', () => {
      expect(isRetryableError({ code: 'unavailable' })).toBe(true);
      expect(isRetryableError({ code: 'deadline-exceeded' })).toBe(true);
      expect(isRetryableError({ code: 'resource-exhausted' })).toBe(true);
      expect(isRetryableError({ code: 'network-error' })).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      expect(isRetryableError({ code: 'permission-denied' })).toBe(false);
      expect(isRetryableError({ code: 'not-found' })).toBe(false);
      expect(isRetryableError({ code: 'invalid-argument' })).toBe(false);
      expect(isRetryableError({ code: 'already-exists' })).toBe(false);
    });

    it('should return false for unknown error code', () => {
      expect(isRetryableError({ code: 'unknown-code' })).toBe(false);
    });

    it('should return false for error without code', () => {
      expect(isRetryableError({})).toBe(false);
      expect(isRetryableError({ message: 'Error' })).toBe(false);
    });
  });
});
