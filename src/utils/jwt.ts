import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { JWTRequest } from '../interfaces/Jwt-Request.interface';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/*
export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
}
*/


export const generateToken = (payload: JWTRequest): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'gym-management-system'
  });
};

export const verifyToken = (token: string): JWTRequest => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTRequest;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'gym-management-system'
  });
};