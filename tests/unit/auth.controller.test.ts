import { Request, Response } from 'express';
import { AuthController } from '../../src/controllers/auth.controller';
import { authService } from '../../src/services/authService';

jest.mock('../../src/services/authService');

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    authController = new AuthController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('registerNewUser', () => {
    it('should register user successfully', async () => {
      const registrationData = {
        email: 'test@test.com',
        password: 'password',
        full_name: 'Test User',
        age: 25,
        phone: '123456789'
      };

      mockRequest.body = registrationData;

      const mockUser = { id: 'user-id', email: 'test@test.com' };
      const mockRole = { name: 'cliente' };
      const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };

      mockedAuthService.validateEmailNotExists.mockResolvedValue();
      mockedAuthService.createUserWithClientRole.mockResolvedValue({
        user: mockUser as any,
        role: mockRole as any
      });
      mockedAuthService.getUserWithoutPassword.mockResolvedValue(mockUser);
      mockedAuthService.generateAuthTokens.mockReturnValue(mockTokens);

      await authController.registerNewUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });
    });

    it('should handle email already exists error', async () => {
      mockRequest.body = { email: 'existing@test.com' };

      const error = new Error('El email ya está registrado en el sistema.');
      mockedAuthService.validateEmailNotExists.mockRejectedValue(error);

      await authController.registerNewUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El email ya está registrado en el sistema.'
      });
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user successfully', async () => {
      const credentials = { email: 'test@test.com', password: 'password' };
      mockRequest.body = credentials;

      const mockUser = {
        id: 'user-id',
        email: 'test@test.com',
        rol: [{ name: 'cliente' }]
      };
      const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };

      mockedAuthService.validateUserCredentials.mockResolvedValue(mockUser);
      mockedAuthService.extractRoleNames.mockReturnValue(['cliente']);
      mockedAuthService.generateAuthTokens.mockReturnValue(mockTokens);
      mockedAuthService.removePasswordFromUserObject.mockReturnValue(mockUser);

      await authController.authenticateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });
    });
  });
});