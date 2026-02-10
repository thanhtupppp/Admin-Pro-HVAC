/**
 * Unit Tests for authService.ts
 * Tests authentication service functions with mocked Firebase
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { authService, AuthResult } from '../../services/authService';
import { userService } from '../../services/userService';

// Mock Firebase modules
jest.mock('../../services/firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('../../services/userService', () => ({
  userService: {
    getUsers: jest.fn(),
    updateUser: jest.fn(),
    logSession: jest.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // AuthResult interface tests
  // ==========================================
  describe('AuthResult interface', () => {
    it('should define success result structure', () => {
      const result: AuthResult = {
        success: true,
        user: undefined,
      };
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should define failure result structure', () => {
      const result: AuthResult = {
        success: false,
        error: 'Test error message',
      };
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error message');
    });
  });

  // ==========================================
  // signIn tests
  // ==========================================
  describe('signIn', () => {
    it('should return failure when user not in database', async () => {
      const mockUserCredential = {
        user: { uid: 'test-uid', email: 'test@test.com' },
      };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
      (userService.getUsers as jest.Mock).mockResolvedValue([]);

      const result = await authService.signIn('test@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('không có quyền truy cập');
    });

    it('should return failure when user is locked', async () => {
      const mockUserCredential = {
        user: { uid: 'test-uid', email: 'locked@test.com' },
      };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
      (userService.getUsers as jest.Mock).mockResolvedValue([
        { id: '1', email: 'locked@test.com', status: 'locked' },
      ]);

      const result = await authService.signIn('locked@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('đã bị khóa');
    });

    it('should return success for valid active user', async () => {
      const mockUser = { uid: 'test-uid', email: 'active@test.com' };
      const mockUserCredential = { user: mockUser };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
      (userService.getUsers as jest.Mock).mockResolvedValue([
        { id: '1', email: 'active@test.com', status: 'active' },
      ]);
      (userService.updateUser as jest.Mock).mockResolvedValue({});
      (userService.logSession as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.signIn('active@test.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should handle auth/user-not-found error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/user-not-found',
      });

      const result = await authService.signIn('notfound@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email hoặc mật khẩu không đúng');
    });

    it('should handle auth/wrong-password error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/wrong-password',
      });

      const result = await authService.signIn('test@test.com', 'wrongpass');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email hoặc mật khẩu không đúng');
    });

    it('should handle auth/invalid-email error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/invalid-email',
      });

      const result = await authService.signIn('invalid-email', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email không hợp lệ');
    });

    it('should handle auth/too-many-requests error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/too-many-requests',
      });

      const result = await authService.signIn('test@test.com', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quá nhiều lần thử');
    });

    it('should handle network error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/network-request-failed',
      });

      const result = await authService.signIn('test@test.com', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Lỗi kết nối');
    });
  });

  // ==========================================
  // signUp tests
  // ==========================================
  describe('signUp', () => {
    it('should return success on valid signup', async () => {
      const mockUser = { uid: 'new-uid', email: 'new@test.com' };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const result = await authService.signUp('new@test.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should handle auth/email-already-in-use error', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/email-already-in-use',
      });

      const result = await authService.signUp('existing@test.com', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email đã được sử dụng');
    });

    it('should handle auth/weak-password error', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/weak-password',
      });

      const result = await authService.signUp('test@test.com', '123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Mật khẩu quá yếu');
    });
  });

  // ==========================================
  // signOut tests
  // ==========================================
  describe('signOut', () => {
    it('should call Firebase signOut', async () => {
      (firebaseSignOut as jest.Mock).mockResolvedValue(undefined);

      await authService.signOut();

      expect(firebaseSignOut).toHaveBeenCalled();
    });
  });

  // ==========================================
  // getCurrentUser tests
  // ==========================================
  describe('getCurrentUser', () => {
    it('should return null when no user logged in', () => {
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });
  });
});
