import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';
import { HttpError } from 'http-errors';

export interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: any;
}

export const errorHandler = (error: CustomError | HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  // Handle http-errors automatically
  if (error.statusCode && error.statusCode < 500) {
    return ResponseHelper.error(res, error.message, error.statusCode);
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const message = `${field} already exists`;
    return ResponseHelper.conflict(res, message);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error as any).map((val: any) => val.message);
    return ResponseHelper.validationError(res, errors);
  }

  // Mongoose cast error
  if (error.name === 'CastError') {
    return ResponseHelper.error(res, 'Invalid ID format', 400);
  }

  // JWT token errors
  if (error.message === 'Invalid or expired token') {
    return ResponseHelper.unauthorized(res, 'Invalid or expired token');
  }

  // Default error handling
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  return ResponseHelper.error(res, message, statusCode);
};

export const notFoundHandler = (req: Request, res: Response) => {
  return ResponseHelper.notFound(res, `Route ${req.originalUrl} not found`);
};