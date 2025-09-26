import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, optionalAuth } from '../../../src/middleware/auth.middleware';
import { verifyToken } from '../../../src/utils/jwt';
import { ResponseHelper } from '../../../src/utils/response';
import { User } from '../../../src/models/User';
import { Role } from '../../../src/models/Role';
import { mockUserDocument, mockRoleDocument, mockTokenPayload } from '../../fixtures/testData';

jest.mock('../../../src/utils/jwt');
jest.mock('../../../src/utils/response');
jest.mock('../../../src/models/User');
jest.mock('../../../src/models/Role');

const MockedVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const MockedResponseHelper = ResponseHelper as jest.MockedClass<typeof ResponseHelper>;
const MockedUser = User as jest.MockedClass<typeof User>;
const MockedRole = Role as jest.MockedClass<typeof Role>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token', async () => {
      const token = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      MockedVerifyToken.mockReturnValue(mockTokenPayload);

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(MockedVerifyToken).toHaveBeenCalledWith(token);
      expect(mockRequest.user).toEqual(mockTokenPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject when no authorization header', async () => {
      mockRequest.headers = {};

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        'No authorization header provided'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when authorization header has no token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer'
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        'No token provided'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when authorization header is malformed', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        'No token provided'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when token is invalid', async () => {
      const invalidToken = 'invalid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${invalidToken}`
      };

      MockedVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        'Invalid or expired token'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when token is expired', async () => {
      const expiredToken = 'expired.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`
      };

      MockedVerifyToken.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        'Invalid or expired token'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should authorize user with required role', async () => {
      const requiredRoles = ['admin'];
      const authMiddleware = authorize(requiredRoles);

      mockRequest.user = mockTokenPayload;

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUserDocument)
      });

      MockedRole.find = jest.fn().mockResolvedValue([
        { ...mockRoleDocument, name: 'admin' }
      ]);

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: mockTokenPayload.userId });
      expect(MockedRole.find).toHaveBeenCalledWith({ _id: { $in: mockUserDocument.rol } });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should authorize user with multiple roles when one matches', async () => {
      const requiredRoles = ['admin', 'coach'];
      const authMiddleware = authorize(requiredRoles);

      mockRequest.user = mockTokenPayload;

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUserDocument)
      });

      MockedRole.find = jest.fn().mockResolvedValue([
        { ...mockRoleDocument, name: 'coach' }
      ]);

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject when user is not authenticated', async () => {
      const requiredRoles = ['admin'];
      const authMiddleware = authorize(requiredRoles);

      mockRequest.user = undefined;

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        'Authentication required'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when user is not found', async () => {
      const requiredRoles = ['admin'];
      const authMiddleware = authorize(requiredRoles);

      mockRequest.user = mockTokenPayload;

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        'User not found'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when user does not have required role', async () => {
      const requiredRoles = ['admin'];
      const authMiddleware = authorize(requiredRoles);

      mockRequest.user = mockTokenPayload;

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUserDocument)
      });

      MockedRole.find = jest.fn().mockResolvedValue([
        { ...mockRoleDocument, name: 'cliente' }
      ]);

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.forbidden).toHaveBeenCalledWith(
        mockResponse,
        'Access denied. Required roles: admin'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject when user has no roles', async () => {
      const requiredRoles = ['admin'];
      const authMiddleware = authorize(requiredRoles);

      mockRequest.user = mockTokenPayload;

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUserDocument)
      });

      MockedRole.find = jest.fn().mockResolvedValue([]);

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.forbidden).toHaveBeenCalledWith(
        mockResponse,
        'Access denied. Required roles: admin'
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const requiredRoles = ['admin'];
      const authMiddleware = authorize(requiredRoles);

      mockRequest.user = mockTokenPayload;

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Authorization error',
        500
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should display multiple required roles in error message', async () => {
      const requiredRoles = ['admin', 'coach', 'recepcionista'];
      const authMiddleware = authorize(requiredRoles);

      mockRequest.user = mockTokenPayload;

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUserDocument)
      });

      MockedRole.find = jest.fn().mockResolvedValue([
        { ...mockRoleDocument, name: 'cliente' }
      ]);

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.forbidden).toHaveBeenCalledWith(
        mockResponse,
        'Access denied. Required roles: admin, coach, recepcionista'
      );
    });
  });

  describe('optionalAuth', () => {
    it('should set user when valid token is provided', async () => {
      const token = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      MockedVerifyToken.mockReturnValue(mockTokenPayload);

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(MockedVerifyToken).toHaveBeenCalledWith(token);
      expect(mockRequest.user).toEqual(mockTokenPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when no authorization header', async () => {
      mockRequest.headers = {};

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when authorization header has no token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer'
      };

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when token is invalid', async () => {
      const invalidToken = 'invalid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${invalidToken}`
      };

      MockedVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when token is expired', async () => {
      const expiredToken = 'expired.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`
      };

      MockedVerifyToken.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle unexpected errors gracefully', async () => {
      const token = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      MockedVerifyToken.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});