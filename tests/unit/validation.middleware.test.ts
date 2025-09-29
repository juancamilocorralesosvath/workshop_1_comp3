import { Request, Response, NextFunction } from 'express';
import { validateSchema } from '../../src/middleware/validation.middleware';
import { z } from 'zod';

describe('ValidationMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('validateSchema', () => {
    const testSchema = z.object({
      email: z.string().email(),
      name: z.string().min(2)
    });

    it('should pass validation with valid data', () => {
      mockRequest.body = {
        email: 'test@test.com',
        name: 'Test User'
      };

      const middleware = validateSchema(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid data', () => {
      mockRequest.body = {
        email: 'invalid-email',
        name: 'a'
      };

      const middleware = validateSchema(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing body', () => {
      mockRequest.body = undefined;

      const middleware = validateSchema(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});