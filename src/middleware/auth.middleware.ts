import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwtService';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; roles: string[] };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    token = token.replace('Bearer ', '');
    const decoded = verifyToken(token);
    console.log('🔑 Token decoded:', { userId: decoded.userId, email: decoded.email, roles: decoded.roles });
    //obtenemos el user del token
    req.user = decoded;

    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !requiredRoles.some(role => user.roles.includes(role))) {
      return res.status(403).json({
        message: `Forbidden. Required roles: ${requiredRoles.join(', ')}`,
      });
    }

    next();
  };
};