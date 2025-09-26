import { jest } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../setup/testApp';
import { User } from '../../src/models/User';
import { Role } from '../../src/models/Role';
import { verifyToken } from '../../src/utils/jwt';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../src/config/constants';
import {
  mockUserDocument,
  mockRoleDocument,
  createValidCreateUserDTO,
  createValidUpdateUserDTO,
  mockTokenPayload
} from '../fixtures/testData';

jest.mock('../../src/models/User');
jest.mock('../../src/models/Role');
jest.mock('../../src/utils/jwt');
jest.mock('../../src/utils/generateId', () => ({
  generateUserId: jest.fn().mockReturnValue('user_123456789012'),
}));

const MockedUser = User as jest.MockedClass<typeof User>;
const MockedRole = Role as jest.MockedClass<typeof Role>;
const MockedVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('User Integration Tests', () => {
  let app: Express;
  let adminToken: string;
  let recepcionistaToken: string;
  let clienteToken: string;

  beforeAll(() => {
    app = createTestApp();
    adminToken = 'admin.jwt.token';
    recepcionistaToken = 'recepcionista.jwt.token';
    clienteToken = 'cliente.jwt.token';
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock token verification for different users
    MockedVerifyToken.mockImplementation((token: string) => {
      if (token === adminToken) {
        return { ...mockTokenPayload, roles: ['admin'] };
      } else if (token === recepcionistaToken) {
        return { ...mockTokenPayload, roles: ['recepcionista'] };
      } else if (token === clienteToken) {
        return { ...mockTokenPayload, roles: ['cliente'] };
      }
      throw new Error('Invalid token');
    });

    // Mock user and role finding for authorization
    MockedUser.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUserDocument)
    });

    MockedRole.find = jest.fn().mockImplementation((query) => {
      if (query._id.$in.includes('admin_role_id')) {
        return Promise.resolve([{ name: 'admin' }]);
      } else if (query._id.$in.includes('recepcionista_role_id')) {
        return Promise.resolve([{ name: 'recepcionista' }]);
      } else {
        return Promise.resolve([{ name: 'cliente' }]);
      }
    });
  });

  describe('GET /api/users', () => {
    it('should get all users with admin token', async () => {
      const mockPaginatedUsers = {
        users: [mockUserDocument],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        }
      };

      MockedUser.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue([mockUserDocument])
              })
            })
          })
        })
      });
      MockedUser.countDocuments = jest.fn().mockResolvedValue(1);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.USERS_RETRIEVED);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should get all users with recepcionista token', async () => {
      MockedUser.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue([mockUserDocument])
              })
            })
          })
        })
      });
      MockedUser.countDocuments = jest.fn().mockResolvedValue(1);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${recepcionistaToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 with cliente token', async () => {
      MockedRole.find = jest.fn().mockResolvedValue([{ name: 'cliente' }]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle query parameters for filtering', async () => {
      MockedUser.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue([])
              })
            })
          })
        })
      });
      MockedUser.countDocuments = jest.fn().mockResolvedValue(0);

      const response = await request(app)
        .get('/api/users?search=test&isActive=true&page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id with admin token', async () => {
      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUserDocument)
        })
      });

      const response = await request(app)
        .get('/api/users/user_123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.USER_RETRIEVED);
      expect(response.body.data).toEqual(mockUserDocument);
    });

    it('should return 403 with cliente token', async () => {
      MockedRole.find = jest.fn().mockResolvedValue([{ name: 'cliente' }]);

      const response = await request(app)
        .get('/api/users/user_123')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .get('/api/users/user_123');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    it('should create user with admin token', async () => {
      const userData = createValidCreateUserDTO();
      const mockSavedUser = { ...mockUserDocument, save: jest.fn().mockResolvedValue(mockUserDocument) };

      MockedUser.findOne = jest.fn().mockResolvedValue(null);
      MockedRole.findOne = jest.fn().mockResolvedValue(mockRoleDocument);
      MockedUser.mockImplementation(() => mockSavedUser as any);
      MockedUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUserDocument)
        })
      });

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: userData.email,
          password: userData.password,
          fulll_name: userData.fullName,
          age: userData.age,
          phone: userData.phone
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.USER_CREATED);
    });

    it('should return 403 with cliente token', async () => {
      MockedRole.find = jest.fn().mockResolvedValue([{ name: 'cliente' }]);

      const userData = createValidCreateUserDTO();

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          email: userData.email,
          password: userData.password,
          fulll_name: userData.fullName,
          age: userData.age,
          phone: userData.phone
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization', async () => {
      const userData = createValidCreateUserDTO();

      const response = await request(app)
        .post('/api/users')
        .send({
          email: userData.email,
          password: userData.password,
          fulll_name: userData.fullName,
          age: userData.age,
          phone: userData.phone
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user with admin token', async () => {
      const updateData = createValidUpdateUserDTO();
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

      const response = await request(app)
        .put('/api/users/user_123')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: updateData.email,
          fulll_name: updateData.fullName,
          age: updateData.age,
          phone: updateData.phone,
          isActive: updateData.isActive
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.USER_UPDATED);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        email: 'invalid-email',
        fulll_name: 'J'
      };

      const response = await request(app)
        .put('/api/users/user_123')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 with cliente token', async () => {
      MockedRole.find = jest.fn().mockResolvedValue([{ name: 'cliente' }]);

      const response = await request(app)
        .put('/api/users/user_123')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ fulll_name: 'Updated Name' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user with admin token', async () => {
      MockedUser.findOne = jest.fn().mockResolvedValue(mockUserDocument);
      MockedUser.findByIdAndDelete = jest.fn().mockResolvedValue(mockUserDocument);

      const response = await request(app)
        .delete('/api/users/user_123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.USER_DELETED);
    });

    it('should return 403 with recepcionista token', async () => {
      MockedRole.find = jest.fn().mockResolvedValue([{ name: 'recepcionista' }]);

      const response = await request(app)
        .delete('/api/users/user_123')
        .set('Authorization', `Bearer ${recepcionistaToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 with cliente token', async () => {
      MockedRole.find = jest.fn().mockResolvedValue([{ name: 'cliente' }]);

      const response = await request(app)
        .delete('/api/users/user_123')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .delete('/api/users/user_123');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/users/:id/toggle-status', () => {
    it('should toggle user status with admin token', async () => {
      const activatedUser = { ...mockUserDocument, isActive: true };
      const mockUser = {
        ...mockUserDocument,
        isActive: false,
        save: jest.fn().mockResolvedValue(mockUserDocument)
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);
      MockedUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(activatedUser)
        })
      });

      const response = await request(app)
        .patch('/api/users/user_123/toggle-status')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.USER_ACTIVATED);
    });

    it('should return 403 with recepcionista token', async () => {
      MockedRole.find = jest.fn().mockResolvedValue([{ name: 'recepcionista' }]);

      const response = await request(app)
        .patch('/api/users/user_123/toggle-status')
        .set('Authorization', `Bearer ${recepcionistaToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .patch('/api/users/user_123/toggle-status');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/assign-roles', () => {
    it('should assign roles with admin token', async () => {
      const roleAssignmentData = {
        userId: 'user_123',
        roleIds: ['role1', 'role2']
      };

      const mockUser = {
        ...mockUserDocument,
        save: jest.fn().mockResolvedValue(mockUserDocument)
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);
      MockedRole.find = jest.fn().mockResolvedValue([mockRoleDocument, mockRoleDocument]);
      MockedUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUserDocument)
        })
      });

      const response = await request(app)
        .post('/api/users/assign-roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleAssignmentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(SUCCESS_MESSAGES.ROLES_ASSIGNED);
    });

    it('should return 400 for invalid role assignment data', async () => {
      const invalidData = {
        userId: '',
        roleIds: []
      };

      const response = await request(app)
        .post('/api/users/assign-roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 with recepcionista token', async () => {
      MockedRole.find = jest.fn().mockResolvedValue([{ name: 'recepcionista' }]);

      const roleAssignmentData = {
        userId: 'user_123',
        roleIds: ['role1', 'role2']
      };

      const response = await request(app)
        .post('/api/users/assign-roles')
        .set('Authorization', `Bearer ${recepcionistaToken}`)
        .send(roleAssignmentData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authorization', async () => {
      const roleAssignmentData = {
        userId: 'user_123',
        roleIds: ['role1', 'role2']
      };

      const response = await request(app)
        .post('/api/users/assign-roles')
        .send(roleAssignmentData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});