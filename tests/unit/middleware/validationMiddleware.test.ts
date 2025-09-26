import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  validate,
  registerSchema,
  loginSchema,
  updateUserSchema,
  assignRoleSchema,
  createRoleSchema,
  createPermissionSchema
} from '../../../src/middleware/validation.middleware';
import { ResponseHelper } from '../../../src/utils/response';

jest.mock('../../../src/utils/response');

const MockedResponseHelper = ResponseHelper as jest.MockedClass<typeof ResponseHelper>;

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('validate function', () => {
    const testSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      age: z.number().min(1, 'Age must be positive')
    });

    it('should pass validation with valid data', () => {
      mockRequest.body = {
        name: 'John Doe',
        age: 25
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(ResponseHelper.validationError).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid data', () => {
      mockRequest.body = {
        name: 'J',
        age: -1
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.validationError).toHaveBeenCalledWith(
        mockResponse,
        expect.arrayContaining([
          expect.stringContaining('Name must be at least 2 characters'),
          expect.stringContaining('Age must be positive')
        ])
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation with missing data', () => {
      mockRequest.body = {};

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.validationError).toHaveBeenCalledWith(
        mockResponse,
        expect.arrayContaining([
          expect.stringContaining('Required'),
          expect.stringContaining('Required')
        ])
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle non-ZodError exceptions', () => {
      const faultySchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Non-Zod error');
        })
      } as any;

      mockRequest.body = { test: 'data' };

      const middleware = validate(faultySchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Validation failed',
        400
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        fulll_name: 'John Doe',
        age: '25',
        phone: '+573001234567'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        fulll_name: 'John Doe',
        age: '25',
        phone: '+573001234567'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Invalid email format')).toBe(true);
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        fulll_name: 'John Doe',
        age: '25',
        phone: '+573001234567'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Password must be at least 6 characters')).toBe(true);
      }
    });

    it('should reject short full name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        fulll_name: 'J',
        age: '25',
        phone: '+573001234567'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Full name must be at least 2 characters')).toBe(true);
      }
    });

    it('should reject empty age', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        fulll_name: 'John Doe',
        age: '',
        phone: '+573001234567'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Age is required')).toBe(true);
      }
    });

    it('should reject short phone', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        fulll_name: 'John Doe',
        age: '25',
        phone: '123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Phone must be at least 10 characters')).toBe(true);
      }
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Invalid email format')).toBe(true);
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Password is required')).toBe(true);
      }
    });
  });

  describe('updateUserSchema', () => {
    it('should validate correct update data', () => {
      const validData = {
        email: 'updated@example.com',
        fulll_name: 'Updated Name',
        age: '30',
        phone: '+573009999999',
        isActive: true
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate partial update data', () => {
      const validData = {
        fulll_name: 'Updated Name'
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate empty update data', () => {
      const validData = {};

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email in update', () => {
      const invalidData = {
        email: 'invalid-email'
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Invalid email format')).toBe(true);
      }
    });

    it('should reject short full name in update', () => {
      const invalidData = {
        fulll_name: 'J'
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Full name must be at least 2 characters')).toBe(true);
      }
    });
  });

  describe('assignRoleSchema', () => {
    it('should validate correct role assignment data', () => {
      const validData = {
        userId: 'user_123',
        roleIds: ['role1', 'role2']
      };

      const result = assignRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty userId', () => {
      const invalidData = {
        userId: '',
        roleIds: ['role1', 'role2']
      };

      const result = assignRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'User ID is required')).toBe(true);
      }
    });

    it('should reject empty roleIds array', () => {
      const invalidData = {
        userId: 'user_123',
        roleIds: []
      };

      const result = assignRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'At least one role is required')).toBe(true);
      }
    });

    it('should reject missing roleIds', () => {
      const invalidData = {
        userId: 'user_123'
      };

      const result = assignRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createRoleSchema', () => {
    it('should validate correct role creation data', () => {
      const validData = {
        name: 'admin',
        permissions: ['perm1', 'perm2']
      };

      const result = createRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate role creation without permissions', () => {
      const validData = {
        name: 'admin'
      };

      const result = createRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short role name', () => {
      const invalidData = {
        name: 'a'
      };

      const result = createRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Role name must be at least 2 characters')).toBe(true);
      }
    });

    it('should reject empty role name', () => {
      const invalidData = {
        name: ''
      };

      const result = createRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Role name must be at least 2 characters')).toBe(true);
      }
    });
  });

  describe('createPermissionSchema', () => {
    it('should validate correct permission creation data', () => {
      const validData = {
        name: 'user.read'
      };

      const result = createPermissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short permission name', () => {
      const invalidData = {
        name: 'a'
      };

      const result = createPermissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Permission name must be at least 2 characters')).toBe(true);
      }
    });

    it('should reject empty permission name', () => {
      const invalidData = {
        name: ''
      };

      const result = createPermissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message === 'Permission name must be at least 2 characters')).toBe(true);
      }
    });
  });
});