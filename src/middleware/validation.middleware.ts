import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  age: z.number().int().min(1, 'Age must be a positive number').max(120, 'Age must be realistic'),
  phone: z.string().min(5, 'Phone must be at least 5 characters'),
  roleIds: z.array(z.string()).optional()
});

export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  email: z.email('Invalid email format').optional(),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  age: z.number().int().min(1, 'Age must be a positive number').max(120, 'Age must be realistic').optional(),
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

export const createMembershipSchema = z.object({
  name: z.string().min(2, 'Membership name must be at least 2 characters'),
  cost: z.number().min(0, 'Cost must be a positive number'),
  max_classes_assistance: z.number().int().min(0, 'Max classes assistance must be a positive number'),
  max_gym_assistance: z.number().int().min(0, 'Max gym assistance must be a positive number'),
  duration_months: z.number().int().refine(
    (val) => val === 1 || val === 12,
    { message: 'Duration must be 1 (monthly) or 12 (annual) months' }
  ),
  status: z.boolean().optional(),
});

export const updateMembershipSchema = z.object({
  name: z.string().min(2, 'Membership name must be at least 2 characters').optional(),
  cost: z.number().min(0, 'Cost must be a positive number').optional(),
  max_classes_assistance: z.number().int().min(0, 'Max classes assistance must be a positive number').optional(),
  max_gym_assistance: z.number().int().min(0, 'Max gym assistance must be a positive number').optional(),
  duration_months: z.number().int().refine(
    (val) => val === 1 || val === 12,
    { message: 'Duration must be 1 (monthly) or 12 (annual) months' }
  ).optional(),
  status: z.boolean().optional(),
});

export const createSubscriptionSchema = z.object({
  userId: z.string().min(1, 'El ID del usuario es requerido.'),
});


export const addMembershipToSubscriptionSchema = z.object({
  membershipId: z.string().min(1, 'El ID de la membresía es requerido.'),
});

export const checkInSchema = z.object({
  type: z.enum(['gym', 'class'], {
    errorMap: () => ({ message: 'Type must be either "gym" or "class"' })
  })
});

export const checkOutSchema = z.object({
}).optional();

export const attendanceHistoryQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'From date must be in YYYY-MM-DD format').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'To date must be in YYYY-MM-DD format').optional(),
  type: z.enum(['gym', 'class'], {
    errorMap: () => ({ message: 'Type must be either "gym" or "class"' })
  }).optional()
});

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Validating body:', req.body);
      schema.parse(req.body);
      next();
    } catch (error) {
      console.log('Validation error:', error);
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
        console.log('Error messages:', errorMessages);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
      });
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Validating query:', req.query);
      schema.parse(req.query);
      next();
    } catch (error) {
      console.log('Query validation error:', error);
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
        console.log('Error messages:', errorMessages);
        return res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors: errorMessages,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
      });
    }
  };
};