import { generateToken, generateRefreshToken, verifyToken } from '../../src/services/jwtService';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('JwtService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  describe('generateToken', () => {
    it('should generate access token successfully', () => {
      const payload = { userId: 'user-id', email: 'test@test.com', roles: ['cliente'] };
      mockedJwt.sign.mockReturnValue('access-token' as any);

      const result = generateToken(payload);

      expect(mockedJwt.sign).toHaveBeenCalledWith(payload, 'test-secret', { expiresIn: '1h' });
      expect(result).toBe('access-token');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token successfully', () => {
      mockedJwt.sign.mockReturnValue('refresh-token' as any);

      const result = generateRefreshToken('user-id');

      expect(mockedJwt.sign).toHaveBeenCalledWith({ userId: 'user-id' }, 'test-secret', { expiresIn: '7d' });
      expect(result).toBe('refresh-token');
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', () => {
      const decodedPayload = { userId: 'user-id', email: 'test@test.com' };
      mockedJwt.verify.mockReturnValue(decodedPayload as any);

      const result = verifyToken('valid-token');

      expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(result).toEqual(decodedPayload);
    });

    it('should handle verification errors', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      try {
        verifyToken('invalid-token');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid token');
      }
    });
  });
});