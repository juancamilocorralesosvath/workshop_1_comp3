import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
}

export class ResponseHelper {
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string = 'Error', statusCode: number = 500, error?: string) {
    const response: ApiResponse = {
      success: false,
      message,
      error
    };
    return res.status(statusCode).json(response);
  }

  static validationError(res: Response, errors: string[], message: string = 'Validation failed') {
    const response: ApiResponse = {
      success: false,
      message,
      errors
    };
    return res.status(400).json(response);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden access') {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message: string = 'Resource already exists') {
    return this.error(res, message, 409);
  }
}