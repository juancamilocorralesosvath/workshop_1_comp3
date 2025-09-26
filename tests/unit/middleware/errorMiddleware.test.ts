import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler, CustomError } from '../../../src/middleware/error.middleware';
import { ResponseHelper } from '../../../src/utils/response';

jest.mock('../../../src/utils/response');

const MockedResponseHelper = ResponseHelper as jest.MockedClass<typeof ResponseHelper>;

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/api/test'
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle MongoDB duplicate key error (code 11000)', () => {
      const error: CustomError = {
        name: 'MongoError',
        message: 'Duplicate key error',
        code: 11000,
        keyValue: { email: 'test@example.com' }
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.conflict).toHaveBeenCalledWith(
        mockResponse,
        'email already exists'
      );
      expect(console.error).toHaveBeenCalledWith('Error:', error);
    });

    it('should handle MongoDB duplicate key error with multiple fields', () => {
      const error: CustomError = {
        name: 'MongoError',
        message: 'Duplicate key error',
        code: 11000,
        keyValue: { email: 'test@example.com', phone: '+573001234567' }
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.conflict).toHaveBeenCalledWith(
        mockResponse,
        'email already exists'
      );
    });

    it('should handle Mongoose ValidationError', () => {
      const error: CustomError = {
        name: 'ValidationError',
        message: 'Validation failed',
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is too short' }
        }
      } as any;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.validationError).toHaveBeenCalledWith(
        mockResponse,
        ['Email is required', 'Password is too short']
      );
    });

    it('should handle Mongoose CastError', () => {
      const error: CustomError = {
        name: 'CastError',
        message: 'Cast to ObjectId failed'
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Invalid ID format',
        400
      );
    });

    it('should handle JWT token errors', () => {
      const error: CustomError = {
        name: 'JsonWebTokenError',
        message: 'Invalid or expired token'
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        'Invalid or expired token'
      );
    });

    it('should handle custom errors with statusCode', () => {
      const error: CustomError = {
        name: 'CustomError',
        message: 'Custom error message',
        statusCode: 403
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Custom error message',
        403
      );
    });

    it('should handle generic errors with default 500 status', () => {
      const error: CustomError = {
        name: 'Error',
        message: 'Something went wrong'
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Something went wrong',
        500
      );
    });

    it('should handle errors without message using default message', () => {
      const error: CustomError = {
        name: 'Error',
        message: ''
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Internal server error',
        500
      );
    });

    it('should log all errors to console', () => {
      const error: CustomError = {
        name: 'TestError',
        message: 'Test error message'
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('Error:', error);
    });

    it('should handle errors with undefined keyValue', () => {
      const error: CustomError = {
        name: 'MongoError',
        message: 'Duplicate key error',
        code: 11000,
        keyValue: undefined
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Duplicate key error',
        500
      );
    });

    it('should handle ValidationError with empty errors object', () => {
      const error: CustomError = {
        name: 'ValidationError',
        message: 'Validation failed',
        errors: {}
      } as any;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.validationError).toHaveBeenCalledWith(
        mockResponse,
        []
      );
    });

    it('should handle errors that are instances of Error class', () => {
      const error = new Error('Standard error message') as CustomError;
      error.statusCode = 422;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Standard error message',
        422
      );
    });

    it('should handle null or undefined error gracefully', () => {
      const error = null as any;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Internal server error',
        500
      );
    });
  });

  describe('notFoundHandler', () => {
    it('should handle 404 not found for any route', () => {
      mockRequest.originalUrl = '/api/nonexistent';

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(ResponseHelper.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Route /api/nonexistent not found'
      );
    });

    it('should handle 404 for root route', () => {
      mockRequest.originalUrl = '/';

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(ResponseHelper.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Route / not found'
      );
    });

    it('should handle 404 for complex routes with query parameters', () => {
      mockRequest.originalUrl = '/api/users?search=test&page=1';

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(ResponseHelper.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Route /api/users?search=test&page=1 not found'
      );
    });

    it('should handle 404 for routes with special characters', () => {
      mockRequest.originalUrl = '/api/users/123/roles%20test';

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(ResponseHelper.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Route /api/users/123/roles%20test not found'
      );
    });

    it('should handle undefined originalUrl', () => {
      mockRequest.originalUrl = undefined;

      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(ResponseHelper.notFound).toHaveBeenCalledWith(
        mockResponse,
        'Route undefined not found'
      );
    });
  });
});