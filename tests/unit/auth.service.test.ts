import { authService } from '../../src/services/authService';
import { User } from '../../src/models/User';
import { Role } from '../../src/models/Role';
import { subscriptionService } from '../../src/services/subscriptionService';
import bcrypt from 'bcryptjs';

jest.mock('../../src/models/User');
jest.mock('../../src/models/Role');
jest.mock('../../src/services/subscriptionService');
jest.mock('bcryptjs');

const MockedUser = User as jest.Mocked<typeof User>;
const MockedRole = Role as jest.Mocked<typeof Role>;
const mockedSubscriptionService = subscriptionService as jest.Mocked<typeof subscriptionService>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEmailNotExists', () => {
    it('should not throw error when email does not exist', async () => {
      MockedUser.findOne.mockResolvedValue(null);

      await expect(authService.validateEmailNotExists('test@test.com')).resolves.not.toThrow();
    });

    it('should throw error when email already exists', async () => {
      MockedUser.findOne.mockResolvedValue({ email: 'test@test.com' } as any);

      await expect(authService.validateEmailNotExists('test@test.com')).rejects.toThrow();
    });
  });

  describe('validateUserCredentials', () => {
    const mockUser = {
      _id: 'user-id',
      email: 'test@test.com',
      password: 'hashedPassword',
      isActive: true,
      rol: [{ name: 'cliente' }],
      save: jest.fn()
    };

    it('should validate credentials successfully', async () => {
      MockedUser.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      } as any);
      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await authService.validateUserCredentials('test@test.com', 'password');

      expect(result.email).toBe('test@test.com');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error for invalid password', async () => {
      MockedUser.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      } as any);
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(authService.validateUserCredentials('test@test.com', 'wrongpass')).rejects.toThrow();
    });
  });

  describe('createUserWithClientRole', () => {
    const userData = {
      email: 'test@test.com',
      password: 'password',
      full_name: 'Test User',
      age: 25,
      phone: '123456789'
    };

    it('should create user with client role successfully', async () => {
      const mockRole = { _id: 'role-id', name: 'cliente' };
      const mockNewUser = { _id: 'user-id', save: jest.fn() };

      MockedRole.findOne.mockResolvedValue(mockRole as any);
      MockedUser.mockImplementation(() => mockNewUser as any);
      mockNewUser.save.mockResolvedValue(undefined);
      mockedSubscriptionService.createSubscriptionForUser.mockResolvedValue(undefined);

      const result = await authService.createUserWithClientRole(userData);

      expect(result.user).toBe(mockNewUser);
      expect(result.role).toBe(mockRole);
      expect(mockedSubscriptionService.createSubscriptionForUser).toHaveBeenCalled();
    });
  });
});