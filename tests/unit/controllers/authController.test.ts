import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../../src/controllers/auth.controller';
import { AuthService } from '../../../src/services/authService';
import { User } from '../../../src/models/User';
import { ResponseHelper } from '../../../src/utils/response';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../src/config/constants';
import {
  UserRegistrationDTO,
  UserCredentialsDTO,
  AuthResponseDTO,
  UserProfileUpdateDTO,
  PasswordChangeDTO
} from '../../../src/dto/AuthDTO';
import {
  mockUserDocument,
  mockRoleDocument,
  createValidUserRegistrationDTO,
  createValidUserCredentialsDTO,
  mockAuthTokens
} from '../../fixtures/testData';

jest.mock('../../../src/models/User');
jest.mock('../../../src/services/authService');
jest.mock('../../../src/utils/response');
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

const MockedUser = User as jest.MockedClass<typeof User>;
const MockedAuthService = AuthService as jest.MockedClass<typeof AuthService>;
const MockedResponseHelper = ResponseHelper as jest.MockedClass<typeof ResponseHelper>;

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockAuthService = {
      validateEmailNotExists: jest.fn(),
      createUserWithClientRole: jest.fn(),
      getUserWithoutPassword: jest.fn(),
      generateAuthTokens: jest.fn(),
      validateUserCredentials: jest.fn(),
      extractRoleNames: jest.fn(),
      removePasswordFromUserObject: jest.fn()
    } as any;

    authController = new AuthController(mockAuthService);

    mockRequest = {
      body: {},
      user: undefined
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('registerNewUser', () => {
    it('should register new user successfully', async () => {
      const registrationData = createValidUserRegistrationDTO();
      const userWithoutPassword = { ...mockUserDocument };
      delete userWithoutPassword.password;

      mockRequest.body = {
        email: registrationData.email,
        password: registrationData.password,
        fulll_name: registrationData.fulll_name,
        age: registrationData.age,
        phone: registrationData.phone
      };

      mockAuthService.validateEmailNotExists.mockResolvedValue(undefined);
      mockAuthService.createUserWithClientRole.mockResolvedValue({
        user: mockUserDocument,
        role: mockRoleDocument
      });
      mockAuthService.getUserWithoutPassword.mockResolvedValue(userWithoutPassword);
      mockAuthService.generateAuthTokens.mockReturnValue(mockAuthTokens);

      await authController.registerNewUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.validateEmailNotExists).toHaveBeenCalledWith(registrationData.email);
      expect(mockAuthService.createUserWithClientRole).toHaveBeenCalledWith(expect.any(UserRegistrationDTO));
      expect(mockAuthService.getUserWithoutPassword).toHaveBeenCalledWith(mockUserDocument._id);
      expect(mockAuthService.generateAuthTokens).toHaveBeenCalledWith(
        mockUserDocument.id,
        mockUserDocument.email,
        [mockRoleDocument.name]
      );
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        expect.any(AuthResponseDTO),
        SUCCESS_MESSAGES.USER_REGISTERED,
        201
      );
    });

    it('should handle email already exists error', async () => {
      const registrationData = createValidUserRegistrationDTO();
      mockRequest.body = {
        email: registrationData.email,
        password: registrationData.password,
        fulll_name: registrationData.fulll_name,
        age: registrationData.age,
        phone: registrationData.phone
      };

      const error = new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      mockAuthService.validateEmailNotExists.mockRejectedValue(error);

      await authController.registerNewUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle service errors', async () => {
      const registrationData = createValidUserRegistrationDTO();
      mockRequest.body = {
        email: registrationData.email,
        password: registrationData.password,
        fulll_name: registrationData.fulll_name,
        age: registrationData.age,
        phone: registrationData.phone
      };

      const error = new Error('Service error');
      mockAuthService.validateEmailNotExists.mockResolvedValue(undefined);
      mockAuthService.createUserWithClientRole.mockRejectedValue(error);

      await authController.registerNewUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user successfully', async () => {
      const credentials = createValidUserCredentialsDTO();
      const userWithoutPassword = { ...mockUserDocument };
      delete userWithoutPassword.password;

      mockRequest.body = {
        email: credentials.email,
        password: credentials.password
      };

      mockAuthService.validateUserCredentials.mockResolvedValue(mockUserDocument);
      mockAuthService.extractRoleNames.mockReturnValue(['cliente']);
      mockAuthService.generateAuthTokens.mockReturnValue(mockAuthTokens);
      mockAuthService.removePasswordFromUserObject.mockReturnValue(userWithoutPassword);

      await authController.authenticateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.validateUserCredentials).toHaveBeenCalledWith(credentials.email, credentials.password);
      expect(mockAuthService.extractRoleNames).toHaveBeenCalledWith(mockUserDocument);
      expect(mockAuthService.generateAuthTokens).toHaveBeenCalledWith(
        mockUserDocument.id,
        mockUserDocument.email,
        ['cliente']
      );
      expect(mockAuthService.removePasswordFromUserObject).toHaveBeenCalledWith(mockUserDocument);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        expect.any(AuthResponseDTO),
        SUCCESS_MESSAGES.LOGIN_SUCCESSFUL
      );
    });

    it('should handle invalid credentials', async () => {
      const credentials = createValidUserCredentialsDTO();
      mockRequest.body = {
        email: credentials.email,
        password: credentials.password
      };

      const error = new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      mockAuthService.validateUserCredentials.mockRejectedValue(error);

      await authController.authenticateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid.refresh.token';
      mockRequest.body = { refreshToken };

      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ userId: mockUserDocument.id });

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUserDocument)
      });

      mockAuthService.extractRoleNames.mockReturnValue(['cliente']);
      mockAuthService.generateAuthTokens.mockReturnValue(mockAuthTokens);

      await authController.refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, expect.any(String));
      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: mockUserDocument.id });
      expect(mockAuthService.extractRoleNames).toHaveBeenCalledWith(mockUserDocument);
      expect(mockAuthService.generateAuthTokens).toHaveBeenCalledWith(
        mockUserDocument.id,
        mockUserDocument.email,
        ['cliente']
      );
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        {
          token: mockAuthTokens.accessToken,
          refreshToken: mockAuthTokens.refreshToken
        },
        SUCCESS_MESSAGES.TOKEN_REFRESHED
      );
    });

    it('should handle missing refresh token', async () => {
      mockRequest.body = {};

      await authController.refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(mockResponse, 'Refresh token is required');
    });

    it('should handle invalid refresh token', async () => {
      const refreshToken = 'invalid.refresh.token';
      mockRequest.body = { refreshToken };

      const jwt = require('jsonwebtoken');
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authController.refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(mockResponse, 'Invalid refresh token');
    });

    it('should handle user not found', async () => {
      const refreshToken = 'valid.refresh.token';
      mockRequest.body = { refreshToken };

      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ userId: 'nonexistent_user' });

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await authController.refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(mockResponse, 'User not found or deactivated');
    });

    it('should handle inactive user', async () => {
      const refreshToken = 'valid.refresh.token';
      mockRequest.body = { refreshToken };

      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ userId: mockUserDocument.id });

      const inactiveUser = { ...mockUserDocument, isActive: false };
      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(inactiveUser)
      });

      await authController.refreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(mockResponse, 'User not found or deactivated');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await authController.logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        null,
        SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL
      );
    });

    it('should handle logout errors', async () => {
      const error = new Error('Logout error');
      ResponseHelper.success = jest.fn().mockImplementation(() => {
        throw error;
      });

      await authController.logout(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getProfile', () => {
    it('should get profile successfully', async () => {
      const userWithoutPassword = { ...mockUserDocument };
      delete userWithoutPassword.password;

      mockRequest.user = { userId: mockUserDocument.id };
      mockAuthService.getUserWithoutPassword.mockResolvedValue(userWithoutPassword);

      await authController.getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAuthService.getUserWithoutPassword).toHaveBeenCalledWith(mockUserDocument.id);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        userWithoutPassword,
        SUCCESS_MESSAGES.PROFILE_RETRIEVED
      );
    });

    it('should handle missing authentication', async () => {
      mockRequest.user = undefined;

      await authController.getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(mockResponse, 'Authentication required');
    });

    it('should handle service errors', async () => {
      mockRequest.user = { userId: mockUserDocument.id };
      const error = new Error('Service error');
      mockAuthService.getUserWithoutPassword.mockRejectedValue(error);

      await authController.getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const userWithoutPassword = { ...mockUserDocument };
      delete userWithoutPassword.password;

      const mockUser = {
        ...mockUserDocument,
        save: jest.fn().mockResolvedValue(mockUserDocument)
      };

      mockRequest.user = { userId: mockUserDocument.id };
      mockRequest.body = {
        fulll_name: 'Updated Name',
        age: '30',
        phone: '+573009999999'
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);
      mockAuthService.getUserWithoutPassword.mockResolvedValue(userWithoutPassword);

      await authController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: mockUserDocument.id });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockAuthService.getUserWithoutPassword).toHaveBeenCalledWith(mockUser._id);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        userWithoutPassword,
        SUCCESS_MESSAGES.PROFILE_UPDATED
      );
    });

    it('should handle missing authentication', async () => {
      mockRequest.user = undefined;

      await authController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(mockResponse, 'Authentication required');
    });

    it('should handle user not found', async () => {
      mockRequest.user = { userId: 'nonexistent_user' };
      mockRequest.body = {
        fulll_name: 'Updated Name'
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(null);

      await authController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.notFound).toHaveBeenCalledWith(mockResponse, 'User not found');
    });

    it('should handle service errors', async () => {
      const mockUser = {
        ...mockUserDocument,
        save: jest.fn().mockResolvedValue(mockUserDocument)
      };

      mockRequest.user = { userId: mockUserDocument.id };
      mockRequest.body = {
        fulll_name: 'Updated Name'
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);
      const error = new Error('Service error');
      mockAuthService.getUserWithoutPassword.mockRejectedValue(error);

      await authController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        ...mockUserDocument,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(mockUserDocument)
      };

      mockRequest.user = { userId: mockUserDocument.id };
      mockRequest.body = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);

      await authController.changePassword(mockRequest as Request, mockResponse as Response, mockNext);

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: mockUserDocument.id });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('oldpassword');
      expect(mockUser.save).toHaveBeenCalled();
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        null,
        SUCCESS_MESSAGES.PASSWORD_CHANGED
      );
    });

    it('should handle missing authentication', async () => {
      mockRequest.user = undefined;

      await authController.changePassword(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(mockResponse, 'Authentication required');
    });

    it('should handle password too short', async () => {
      mockRequest.user = { userId: mockUserDocument.id };
      mockRequest.body = {
        currentPassword: 'oldpassword',
        newPassword: '123'
      };

      await authController.changePassword(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'New password must be at least 6 characters',
        400
      );
    });

    it('should handle user not found', async () => {
      mockRequest.user = { userId: 'nonexistent_user' };
      mockRequest.body = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(null);

      await authController.changePassword(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.notFound).toHaveBeenCalledWith(mockResponse, 'User not found');
    });

    it('should handle incorrect current password', async () => {
      const mockUser = {
        ...mockUserDocument,
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      mockRequest.user = { userId: mockUserDocument.id };
      mockRequest.body = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);

      await authController.changePassword(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(mockResponse, 'Current password is incorrect');
    });

    it('should handle service errors', async () => {
      const mockUser = {
        ...mockUserDocument,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockRejectedValue(new Error('Save error'))
      };

      mockRequest.user = { userId: mockUserDocument.id };
      mockRequest.body = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);

      await authController.changePassword(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});