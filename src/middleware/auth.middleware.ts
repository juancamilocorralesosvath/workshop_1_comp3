import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { JWTRequest } from '../interfaces/Jwt-Request.interface';
import { ResponseHelper } from '../utils/response';
import { User } from '../models/User';
import { Role } from '../models/Role';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; roles: string[] };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return ResponseHelper.unauthorized(res, 'No authorization header provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return ResponseHelper.unauthorized(res, 'No token provided');
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    return ResponseHelper.unauthorized(res, 'Invalid or expired token');
  }
};

export const authorize = (requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      const user = await User.findOne({ id: req.user.userId }).populate('rol');

      if (!user) {
        return ResponseHelper.unauthorized(res, 'User not found');
      }

      const userRoles = await Role.find({ _id: { $in: user.rol } });
      const userRoleNames = userRoles.map(role => role.name);

      const hasRequiredRole = requiredRoles.some(role => userRoleNames.includes(role));

      if (!hasRequiredRole) {
        return ResponseHelper.forbidden(res, `Access denied. Required roles: ${requiredRoles.join(', ')}`);
      }

      next();
    } catch (error) {
      return ResponseHelper.error(res, 'Authorization error', 500);
    }
  };
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = verifyToken(token);
          req.user = decoded;
        } catch (error) {
          // Token is invalid, but we continue without user
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};