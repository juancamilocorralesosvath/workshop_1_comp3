import { jest } from '@jest/globals';
import { AuthService } from '../../../src/services/authService';
import { User } from '../../../src/models/User';
import { Role } from '../../../src/models/Role';
import { ERROR_MESSAGES } from '../../../src/config/constants';
import {
  mockUserDocument,
  mockRoleDocument,
  createValidUserRegistrationDTO,
  mockAuthTokens
} from '../../fixtures/testData';

// Mock de los modelos
jest.mock('../../../src/models/User');
jest.mock('../../../src/models/Role');
jest.mock('../../../src/utils/generateId', () => ({
  generateUserId: jest.fn().mockReturnValue('user_123456789012'),
}));
jest.mock('../../../src/utils/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock.access.token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock.refresh.token'),
}));

const MockedUser = User as jest.MockedClass<typeof User>;
const MockedRole = Role as jest.MockedClass<typeof Role>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('validateEmailNotExists', () => {
    it('should not throw error when email does not exist', async () => {
      // Arrange
      MockedUser.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.validateEmailNotExists('new@example.com'))
        .resolves
        .not.toThrow();
    });

    it('should throw error when email already exists', async () => {
      // Arrange
      MockedUser.findOne = jest.fn().mockResolvedValue(mockUserDocument);

      // Act & Assert
      await expect(authService.validateEmailNotExists('existing@example.com'))
        .rejects
        .toThrow(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    });

    it('should call User.findOne with correct email', async () => {
      // Arrange
      const email = 'test@example.com';
      MockedUser.findOne = jest.fn().mockResolvedValue(null);

      // Act
      await authService.validateEmailNotExists(email);

      // Assert
      expect(MockedUser.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('createUserWithClientRole', () => {
    it('should create user with client role successfully', async () => {
      // Arrange
      const userData = createValidUserRegistrationDTO();
      const mockSavedUser = { ...mockUserDocument, save: jest.fn().mockResolvedValue(mockUserDocument) };

      MockedRole.findOne = jest.fn().mockResolvedValue(mockRoleDocument);
      MockedUser.prototype.save = jest.fn().mockResolvedValue(mockUserDocument);
      MockedUser.mockImplementation(() => mockSavedUser as any);

      // Act
      const result = await authService.createUserWithClientRole(userData);

      // Assert
      expect(result).toEqual({
        user: mockSavedUser,
        role: mockRoleDocument
      });
      expect(MockedRole.findOne).toHaveBeenCalledWith({ name: 'cliente' });
    });

    it('should throw error when client role not found', async () => {
      // Arrange
      const userData = createValidUserRegistrationDTO();
      MockedRole.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.createUserWithClientRole(userData))
        .rejects
        .toThrow(ERROR_MESSAGES.DEFAULT_ROLE_NOT_FOUND);
    });
  });

  describe('validateUserCredentials', () => {
    it('should validate user credentials successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        ...mockUserDocument,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(mockUserDocument),
        lastLogin: new Date(),
      };

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      // Act
      const result = await authService.validateUserCredentials(email, password);

      // Assert
      expect(result).toBe(mockUser);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      // Act & Assert
      await expect(authService.validateUserCredentials(email, password))
        .rejects
        .toThrow(ERROR_MESSAGES.INVALID_CREDENTIALS);
    });

    it('should throw error when user is inactive', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        ...mockUserDocument,
        isActive: false,
      };

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      // Act & Assert
      await expect(authService.validateUserCredentials(email, password))
        .rejects
        .toThrow(ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
    });

    it('should throw error when password is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockUser = {
        ...mockUserDocument,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      // Act & Assert
      await expect(authService.validateUserCredentials(email, password))
        .rejects
        .toThrow(ERROR_MESSAGES.INVALID_CREDENTIALS);
    });
  });

  describe('generateAuthTokens', () => {
    it('should generate auth tokens correctly', () => {
      // Arrange
      const userId = 'user_123';
      const email = 'test@example.com';
      const roles = ['cliente'];

      // Act
      const result = authService.generateAuthTokens(userId, email, roles);

      // Assert
      expect(result).toEqual({
        accessToken: 'mock.access.token',
        refreshToken: 'mock.refresh.token'
      });
    });
  });

  describe('getUserWithoutPassword', () => {
    it('should return user without password', async () => {
      // Arrange
      const userId = 'user_123';
      const userWithoutPassword = { ...mockUserDocument };
      delete userWithoutPassword.password;

      MockedUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(userWithoutPassword)
        })
      });

      // Act
      const result = await authService.getUserWithoutPassword(userId);

      // Assert
      expect(result).toEqual(userWithoutPassword);
      expect(MockedUser.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('extractRoleNames', () => {
    it('should extract role names from user object', () => {
      // Arrange
      const user = {
        rol: [
          { name: 'admin' },
          { name: 'cliente' }
        ]
      };

      // Act
      const result = authService.extractRoleNames(user);

      // Assert
      expect(result).toEqual(['admin', 'cliente']);
    });

    it('should handle empty roles array', () => {
      // Arrange
      const user = { rol: [] };

      // Act
      const result = authService.extractRoleNames(user);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('removePasswordFromUserObject', () => {
    it('should remove password from user object', () => {
      // Arrange
      const userWithPassword = {
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          password: 'hashedpassword',
          fulll_name: 'Test User'
        })
      };

      // Act
      const result = authService.removePasswordFromUserObject(userWithPassword);

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('fulll_name', 'Test User');
    });
  });
});