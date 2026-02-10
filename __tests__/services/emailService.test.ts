/**
 * Unit Tests for emailService.ts
 * Tests email configuration and sending functions with mocked emailjs
 */

import { emailService } from '../../services/emailService';

// Mock emailjs
jest.mock('@emailjs/browser', () => ({
  init: jest.fn(),
  send: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    clear: () => { store = {}; },
    removeItem: jest.fn((key: string) => { delete store[key]; }),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, configurable: true });

describe('emailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  // ==========================================
  // getConfig tests
  // ==========================================
  describe('getConfig', () => {
    it('should return default config when nothing stored', () => {
      const config = emailService.getConfig();

      expect(config).toHaveProperty('serviceId');
      expect(config).toHaveProperty('publicKey');
      expect(config).toHaveProperty('templates');
    });

    it('should return stored config when available', () => {
      const storedConfig = {
        serviceId: 'test-service',
        publicKey: 'test-key',
        templates: {
          welcome: 'tpl_welcome',
          paymentPending: 'tpl_pending',
          paymentSuccess: 'tpl_success',
          planActivated: 'tpl_activated',
        },
      };
      localStorageMock.setItem('email_config', JSON.stringify(storedConfig));

      const config = emailService.getConfig();

      expect(config.serviceId).toBe('test-service');
      expect(config.publicKey).toBe('test-key');
    });
  });

  // ==========================================
  // saveConfig tests
  // ==========================================
  describe('saveConfig', () => {
    it('should save config to localStorage', () => {
      const config = {
        serviceId: 'my-service',
        publicKey: 'my-key',
        templates: {
          welcome: 'tpl_1',
          paymentPending: 'tpl_2',
          paymentSuccess: 'tpl_3',
          planActivated: 'tpl_4',
        },
      };

      emailService.saveConfig(config);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'email_config',
        JSON.stringify(config)
      );
    });

    it('should initialize emailjs with publicKey', () => {
      const emailjs = require('@emailjs/browser');
      const config = {
        serviceId: 'svc',
        publicKey: 'pk_test123',
        templates: {
          welcome: 'tpl_1',
          paymentPending: 'tpl_2',
          paymentSuccess: 'tpl_3',
          planActivated: 'tpl_4',
        },
      };

      emailService.saveConfig(config);

      expect(emailjs.init).toHaveBeenCalledWith('pk_test123');
    });
  });

  // ==========================================
  // sendTestEmail tests
  // ==========================================
  describe('sendTestEmail', () => {
    it('should throw error when not configured', async () => {
      await expect(emailService.sendTestEmail('test@example.com')).rejects.toThrow(
        'Email service not configured'
      );
    });

    it('should send email when configured', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockResolvedValue({ status: 200 });

      const config = {
        serviceId: 'svc-123',
        publicKey: 'pk-456',
        templates: {
          welcome: 'tpl_welcome',
          paymentPending: 'tpl_2',
          paymentSuccess: 'tpl_3',
          planActivated: 'tpl_4',
        },
      };
      localStorageMock.setItem('email_config', JSON.stringify(config));

      const result = await emailService.sendTestEmail('test@example.com');

      expect(result).toBe(true);
      expect(emailjs.send).toHaveBeenCalled();
    });
  });

  // ==========================================
  // sendWelcomeEmail tests
  // ==========================================
  describe('sendWelcomeEmail', () => {
    it('should not send when not configured', async () => {
      const emailjs = require('@emailjs/browser');
      const user = { email: 'user@test.com', username: 'TestUser' };

      await emailService.sendWelcomeEmail(user as any);

      expect(emailjs.send).not.toHaveBeenCalled();
    });

    it('should send welcome email when configured', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockResolvedValue({ status: 200 });

      const config = {
        serviceId: 'svc',
        publicKey: 'pk',
        templates: {
          welcome: 'tpl_welcome',
          paymentPending: 'tpl_2',
          paymentSuccess: 'tpl_3',
          planActivated: 'tpl_4',
        },
      };
      localStorageMock.setItem('email_config', JSON.stringify(config));

      const user = { email: 'new@test.com', username: 'NewUser' };
      await emailService.sendWelcomeEmail(user as any);

      expect(emailjs.send).toHaveBeenCalled();
    });
  });

  // ==========================================
  // sendPaymentSuccess tests
  // ==========================================
  describe('sendPaymentSuccess', () => {
    it('should send payment confirmation when configured', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockResolvedValue({ status: 200 });

      const config = {
        serviceId: 'svc',
        publicKey: 'pk',
        templates: {
          welcome: 'tpl_1',
          paymentPending: 'tpl_2',
          paymentSuccess: 'tpl_success',
          planActivated: 'tpl_4',
        },
      };
      localStorageMock.setItem('email_config', JSON.stringify(config));

      const transaction = { id: 'txn-123', amount: 500000, planId: 'premium' };
      await emailService.sendPaymentSuccess(transaction as any, 'user@test.com', 'User');

      expect(emailjs.send).toHaveBeenCalled();
    });
  });

  // ==========================================
  // sendPlanActivated tests
  // ==========================================
  describe('sendPlanActivated', () => {
    it('should send plan activation email when configured', async () => {
      const emailjs = require('@emailjs/browser');
      emailjs.send.mockResolvedValue({ status: 200 });

      const config = {
        serviceId: 'svc',
        publicKey: 'pk',
        templates: {
          welcome: 'tpl_1',
          paymentPending: 'tpl_2',
          paymentSuccess: 'tpl_3',
          planActivated: 'tpl_activated',
        },
      };
      localStorageMock.setItem('email_config', JSON.stringify(config));

      const user = { email: 'user@test.com', username: 'User' };
      await emailService.sendPlanActivated(user as any, 'Premium Plan');

      expect(emailjs.send).toHaveBeenCalled();
    });
  });
});
