import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ResponseHelper } from '../utils/response';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fulll_name: z.string().min(2, 'Full name must be at least 2 characters'),
  age: z.string().min(1, 'Age is required'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  fulll_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  age: z.string().min(1, 'Age is required').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 characters').optional(),
  isActive: z.boolean().optional(),
});

export const assignRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  roleIds: z.array(z.string()).min(1, 'At least one role is required'),
});

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  permissions: z.array(z.string()).optional(),
});

export const createPermissionSchema = z.object({
  name: z.string().min(2, 'Permission name must be at least 2 characters'),
});

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return ResponseHelper.validationError(res, errors);
      }
      return ResponseHelper.error(res, 'Validation failed', 400);
    }
  };
};