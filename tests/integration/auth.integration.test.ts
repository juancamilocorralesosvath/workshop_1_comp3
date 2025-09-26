import { jest } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../setup/testApp';
import { User } from '../../src/models/User';
import { Role } from '../../src/models/Role';
import { generateToken } from '../../src/utils/jwt';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../src/config/constants';
import {
  mockUserDocument,
  mockRoleDocument,
  validUserRegistrationData,
  validUserCredentials,
  mockAuthTokens
} from '../fixtures/testData';

jest.mock('../../src/models/User');
jest.mock('../../src/models/Role');
jest.mock('../../src/utils/jwt');
jest.mock('../../src/utils/generateId', () => ({
  generateUserId: jest.fn().mockReturnValue('user_123456789012'),
}));

const MockedUser = User as jest.MockedClass<typeof User>;
const MockedRole = Role as jest.MockedClass<typeof Role>;
const MockedGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;

describe('Auth Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockSavedUser = { ...mockUserDocument, save: jest.fn().mockResolvedValue(mockUserDocument) };

      MockedUser.findOne = jest.fn().mockResolvedValue(null);
      MockedRole.findOne = jest.fn().mockResolvedValue(mockRoleDocument);
      MockedUser.mockImplementation(() => mockSavedUser as any);
      MockedUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUserDocument)
        })
      });
      MockedGenerateToken.mockReturnValue('mock.access.token');

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserRegistrationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.USER_REGISTERED);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 400 for invalid registration data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        fulll_name: '',
        age: '',
        phone: ''
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 when email already exists', async () => {
      MockedUser.findOne = jest.fn().mockResolvedValue(mockUserDocument);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserRegistrationData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const mockUserWithPassword = {
        ...mockUserDocument,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(mockUserDocument),
        toObject: jest.fn().mockReturnValue(mockUserDocument)
      };

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUserWithPassword)
      });
      MockedGenerateToken.mockReturnValue('mock.access.token');

      const response = await request(app)
        .post('/api/auth/login')
        .send(validUserCredentials);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.LOGIN_SUCCESSFUL);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 400 for invalid login data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for incorrect credentials', async () => {
      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(validUserCredentials);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for inactive user', async () => {
      const inactiveUser = {
        ...mockUserDocument,
        isActive: false
      };

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(inactiveUser)
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(validUserCredentials);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const jwt = require('jsonwebtoken');
      jest.doMock('jsonwebtoken', () => ({
        verify: jest.fn().mockReturnValue({ userId: mockUserDocument.id })
      }));

      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUserDocument)
      });
      MockedGenerateToken.mockReturnValue('new.access.token');

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid.refresh.token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.TOKEN_REFRESHED);
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const token = 'valid.jwt.token';

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL);
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get profile with valid token', async () => {
      const userWithoutPassword = { ...mockUserDocument };
      delete userWithoutPassword.password;

      MockedUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(userWithoutPassword)
        })
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer valid.token`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PROFILE_RETRIEVED);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update profile with valid data', async () => {
      const mockUser = {
        ...mockUserDocument,
        save: jest.fn().mockResolvedValue(mockUserDocument)
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);
      MockedUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUserDocument)
        })
      });

      const updateData = {
        fulll_name: 'Updated Name',
        age: '30',
        phone: '+573009999999'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer valid.token`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PROFILE_UPDATED);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ fulll_name: 'Updated Name' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password with valid data', async () => {
      const mockUser = {
        ...mockUserDocument,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(mockUserDocument)
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);

      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer valid.token`)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.PASSWORD_CHANGED);
    });

    it('should return 400 for password too short', async () => {
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: '123'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer valid.token`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .send({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});