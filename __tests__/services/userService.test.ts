/**
 * Unit Tests for userService.ts
 * Tests user management operations with mocked Firestore
 */

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { userService } from '../../services/userService';

// Mock Firebase modules
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
}));

jest.mock('../../services/emailService', () => ({
  emailService: {
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // getUsers tests
  // ==========================================
  describe('getUsers', () => {
    it('should return empty array when no users exist', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: jest.fn(),
      });

      const result = await userService.getUsers();

      expect(result).toEqual([]);
    });

    it('should return array of users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', username: 'User1' },
        { id: '2', email: 'user2@test.com', username: 'User2' },
      ];
      
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          mockUsers.forEach((user) => {
            callback({
              id: user.id,
              data: () => ({ email: user.email, username: user.username }),
            });
          });
        },
      });

      const result = await userService.getUsers();

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@test.com');
    });

    it('should catch and log errors, returning empty array', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const result = await userService.getUsers();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Fetch users failed', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // getUser tests
  // ==========================================
  describe('getUser', () => {
    it('should return user when found', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'user-123',
        data: () => ({ email: 'found@test.com', username: 'Found' }),
      });

      const result = await userService.getUser('user-123');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('found@test.com');
    });

    it('should return null when user not found', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await userService.getUser('nonexistent');

      expect(result).toBeNull();
    });

    it('should catch errors and return null', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockRejectedValue(new Error('Get failed'));

      const result = await userService.getUser('error-id');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ==========================================
  // createUser tests
  // ==========================================
  describe('createUser', () => {
    it('should create user with auto-generated avatar from name', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'new-user-123' });

      const userData = {
        email: 'new@test.com',
        username: 'John.Doe',
        role: 'admin' as const,
        status: 'active' as const,
      };

      const result = await userService.createUser(userData);

      expect(result.id).toBe('new-user-123');
      expect(result.avatar).toBe('JD'); // First letters of John and Doe
      expect(result.lastLogin).toBe('Chưa đăng nhập');
    });

    it('should handle single-word username', async () => {
      (addDoc as jest.Mock).mockResolvedValue({ id: 'user-456' });

      const userData = {
        email: 'single@test.com',
        username: 'Admin',
        role: 'admin' as const,
        status: 'active' as const,
      };

      const result = await userService.createUser(userData);

      expect(result.avatar).toBe('AD'); // First 2 characters
    });
  });

  // ==========================================
  // updateUser tests
  // ==========================================
  describe('updateUser', () => {
    it('should update user and return optimistic result', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.updateUser('user-123', { status: 'locked' });

      expect(updateDoc).toHaveBeenCalled();
      expect(result.id).toBe('user-123');
      expect(result.status).toBe('locked');
    });
  });

  // ==========================================
  // deleteUser tests
  // ==========================================
  describe('deleteUser', () => {
    it('should delete user document', async () => {
      (doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await userService.deleteUser('user-to-delete');

      expect(deleteDoc).toHaveBeenCalledWith('mock-doc-ref');
    });
  });

  // ==========================================
  // toggleStatus tests
  // ==========================================
  describe('toggleStatus', () => {
    it('should toggle active to locked', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'user-123',
        data: () => ({ status: 'active', email: 'test@test.com' }),
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.toggleStatus('user-123');

      expect(result.status).toBe('locked');
    });

    it('should toggle locked to active', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'user-456',
        data: () => ({ status: 'locked', email: 'locked@test.com' }),
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await userService.toggleStatus('user-456');

      expect(result.status).toBe('active');
    });

    it('should throw error when user not found', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      await expect(userService.toggleStatus('nonexistent')).rejects.toThrow('User not found');
    });
  });

  // ==========================================
  // logSession tests
  // ==========================================
  describe('logSession', () => {
    it('should add new session for user', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ activeSessions: [] }),
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await userService.logSession('user-123', {
        deviceId: 'device-abc',
        userAgent: 'Mozilla/5.0',
      });

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should update existing session', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          activeSessions: [
            {
              deviceId: 'device-abc',
              userAgent: 'Old UA',
              lastActive: new Date().toISOString(),
            },
          ],
        }),
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await userService.logSession('user-123', {
        deviceId: 'device-abc',
        userAgent: 'New UA',
      });

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should detect mobile device type', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ activeSessions: [] }),
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await userService.logSession('user-123', {
        deviceId: 'mobile-device',
        // userAgent must contain 'mobile' (case-insensitive) to be detected as mobile
        userAgent: 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36',
      });

      // Check that updateDoc was called with mobile device type
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall.activeSessions[0].deviceType).toBe('Mobile');
    });
  });
});
