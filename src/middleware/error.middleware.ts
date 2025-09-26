import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';

export interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: any;
}

export const errorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const message = `${field} already exists`;
    return ResponseHelper.conflict(res, message);
  }

  if (error.name === 'ValidationError') {
    const errors = Object.values(error as any).map((val: any) => val.message);
    return ResponseHelper.validationError(res, errors);
  }

  if (error.name === 'CastError') {
    return ResponseHelper.error(res, 'Invalid ID format', 400);
  }

  if (error.message === 'Invalid or expired token') {
    return ResponseHelper.unauthorized(res, 'Invalid or expired token');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  return ResponseHelper.error(res, message, statusCode);
};

export const notFoundHandler = (req: Request, res: Response) => {
  return ResponseHelper.notFound(res, `Route ${req.originalUrl} not found`);
};