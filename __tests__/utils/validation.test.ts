/**
 * Unit Tests for validation.ts
 * Testing all validation utility functions
 */

import {
  validateEmail,
  validateSMTPPort,
  getSMTPPortDescription,
  maskApiKey,
  validateUrl,
  validateRequired
} from '../../utils/validation';

describe('validation utilities', () => {
  
  // ==========================================
  // validateEmail tests
  // ==========================================
  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.org')).toBe(true);
      expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('a@b.cc')).toBe(true);
    });

    it('should return false for email without @', () => {
      expect(validateEmail('testexample.com')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
    });

    it('should return false for email without domain', () => {
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@.')).toBe(false);
    });

    it('should return false for email without username', () => {
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('should return false for email with spaces', () => {
      expect(validateEmail('test @example.com')).toBe(false);
      expect(validateEmail('test@ example.com')).toBe(false);
      expect(validateEmail(' test@example.com')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  // ==========================================
  // validateSMTPPort tests
  // ==========================================
  describe('validateSMTPPort', () => {
    it('should return true for valid SMTP ports', () => {
      expect(validateSMTPPort(25)).toBe(true);
      expect(validateSMTPPort(465)).toBe(true);
      expect(validateSMTPPort(587)).toBe(true);
      expect(validateSMTPPort(2525)).toBe(true);
    });

    it('should return false for invalid ports', () => {
      expect(validateSMTPPort(80)).toBe(false);
      expect(validateSMTPPort(443)).toBe(false);
      expect(validateSMTPPort(8080)).toBe(false);
      expect(validateSMTPPort(3000)).toBe(false);
      expect(validateSMTPPort(0)).toBe(false);
      expect(validateSMTPPort(-1)).toBe(false);
    });
  });

  // ==========================================
  // getSMTPPortDescription tests
  // ==========================================
  describe('getSMTPPortDescription', () => {
    it('should return correct description for port 25', () => {
      expect(getSMTPPortDescription(25)).toBe('SMTP Standard (không mã hóa)');
    });

    it('should return correct description for port 465', () => {
      expect(getSMTPPortDescription(465)).toBe('SMTP với SSL/TLS');
    });

    it('should return correct description for port 587', () => {
      expect(getSMTPPortDescription(587)).toBe('SMTP với STARTTLS (khuyên dùng)');
    });

    it('should return correct description for port 2525', () => {
      expect(getSMTPPortDescription(2525)).toBe('SMTP thay thế (một số provider)');
    });

    it('should return fallback for unknown ports', () => {
      expect(getSMTPPortDescription(8080)).toBe('Port không phổ biến');
      expect(getSMTPPortDescription(0)).toBe('Port không phổ biến');
    });
  });

  // ==========================================
  // maskApiKey tests
  // ==========================================
  describe('maskApiKey', () => {
    it('should mask long API keys correctly', () => {
      const key = 'AIzaSyD1234567890abcdefghijk';
      const masked = maskApiKey(key);
      // maskApiKey shows first 4 and last 6 characters
      expect(masked.startsWith('AIza')).toBe(true);
      expect(masked.endsWith('fghijk')).toBe(true);
      expect(masked).toContain('*');
    });

    it('should return **** for short keys', () => {
      expect(maskApiKey('abc')).toBe('****');
      expect(maskApiKey('123456789')).toBe('****');
    });

    it('should return **** for empty string', () => {
      expect(maskApiKey('')).toBe('****');
    });

    it('should return **** for null/undefined', () => {
      expect(maskApiKey(null as unknown as string)).toBe('****');
      expect(maskApiKey(undefined as unknown as string)).toBe('****');
    });

    it('should handle exactly 10 character key', () => {
      const key = '1234567890';
      const masked = maskApiKey(key);
      expect(masked.startsWith('1234')).toBe(true);
      expect(masked.endsWith('567890')).toBe(true);
    });
  });

  // ==========================================
  // validateUrl tests
  // ==========================================
  describe('validateUrl', () => {
    it('should return true for valid URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
      expect(validateUrl('https://sub.domain.co.uk/path?query=1')).toBe(true);
      expect(validateUrl('ftp://files.example.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('example.com')).toBe(false); // missing protocol
      expect(validateUrl('://missing-protocol.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });
  });

  // ==========================================
  // validateRequired tests
  // ==========================================
  describe('validateRequired', () => {
    it('should return true for non-empty strings', () => {
      expect(validateRequired('hello')).toBe(true);
      expect(validateRequired('a')).toBe(true);
      expect(validateRequired('  trimmed  ')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(validateRequired('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired('\t')).toBe(false);
      expect(validateRequired('\n')).toBe(false);
    });
  });
});
