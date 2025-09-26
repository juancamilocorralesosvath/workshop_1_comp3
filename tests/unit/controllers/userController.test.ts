import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { UserController } from '../../../src/controllers/user.controller';
import { UserService } from '../../../src/services/userService';
import { ResponseHelper } from '../../../src/utils/response';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../src/config/constants';
import {
  UserFiltersDTO,
  CreateUserDTO,
  UpdateUserDTO,
  UserIdDTO,
  AssignRolesDTO
} from '../../../src/dto/UserDTO';
import {
  mockUserDocument,
  createValidCreateUserDTO,
  createValidUpdateUserDTO
} from '../../fixtures/testData';

jest.mock('../../../src/services/userService');
jest.mock('../../../src/utils/response');

const MockedUserService = UserService as jest.MockedClass<typeof UserService>;
const MockedResponseHelper = ResponseHelper as jest.MockedClass<typeof ResponseHelper>;

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockUserService = {
      getAllUsersWithFilters: jest.fn(),
      findUserById: jest.fn(),
      createNewUser: jest.fn(),
      updateExistingUser: jest.fn(),
      removeUser: jest.fn(),
      assignRolesToUser: jest.fn(),
      toggleUserActiveStatus: jest.fn()
    } as any;

    userController = new UserController(mockUserService);

    mockRequest = {
      query: {},
      params: {},
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should get all users with filters successfully', async () => {
      const mockPaginatedUsers = {
        users: [mockUserDocument],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        }
      };

      mockRequest.query = {
        search: 'test',
        isActive: 'true',
        page: '1',
        limit: '10'
      };

      mockUserService.getAllUsersWithFilters.mockResolvedValue(mockPaginatedUsers);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getAllUsersWithFilters).toHaveBeenCalledWith(expect.any(UserFiltersDTO));
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockPaginatedUsers,
        SUCCESS_MESSAGES.USERS_RETRIEVED
      );
    });

    it('should handle empty query parameters', async () => {
      const mockPaginatedUsers = {
        users: [mockUserDocument],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        }
      };

      mockRequest.query = {};
      mockUserService.getAllUsersWithFilters.mockResolvedValue(mockPaginatedUsers);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getAllUsersWithFilters).toHaveBeenCalledWith(expect.any(UserFiltersDTO));
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockPaginatedUsers,
        SUCCESS_MESSAGES.USERS_RETRIEVED
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockUserService.getAllUsersWithFilters.mockRejectedValue(error);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      const userId = 'user_123';
      mockRequest.params = { id: userId };
      mockUserService.findUserById.mockResolvedValue(mockUserDocument);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.findUserById).toHaveBeenCalledWith(userId);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockUserDocument,
        SUCCESS_MESSAGES.USER_RETRIEVED
      );
    });

    it('should handle user not found', async () => {
      const userId = 'nonexistent_user';
      mockRequest.params = { id: userId };
      const error = new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      mockUserService.findUserById.mockRejectedValue(error);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle service errors', async () => {
      const userId = 'user_123';
      mockRequest.params = { id: userId };
      const error = new Error('Service error');
      mockUserService.findUserById.mockRejectedValue(error);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = createValidCreateUserDTO();
      mockRequest.body = {
        email: userData.email,
        password: userData.password,
        fulll_name: userData.fullName,
        age: userData.age,
        phone: userData.phone
      };

      mockUserService.createNewUser.mockResolvedValue(mockUserDocument);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.createNewUser).toHaveBeenCalledWith(expect.any(CreateUserDTO));
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockUserDocument,
        SUCCESS_MESSAGES.USER_CREATED,
        201
      );
    });

    it('should create user with role ids', async () => {
      const userData = createValidCreateUserDTO();
      mockRequest.body = {
        email: userData.email,
        password: userData.password,
        fulll_name: userData.fullName,
        age: userData.age,
        phone: userData.phone,
        roleIds: ['role1', 'role2']
      };

      mockUserService.createNewUser.mockResolvedValue(mockUserDocument);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.createNewUser).toHaveBeenCalledWith(expect.objectContaining({
        roleIds: ['role1', 'role2']
      }));
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockUserDocument,
        SUCCESS_MESSAGES.USER_CREATED,
        201
      );
    });

    it('should handle email already exists error', async () => {
      const userData = createValidCreateUserDTO();
      mockRequest.body = {
        email: userData.email,
        password: userData.password,
        fulll_name: userData.fullName,
        age: userData.age,
        phone: userData.phone
      };

      const error = new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      mockUserService.createNewUser.mockRejectedValue(error);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle service errors', async () => {
      const userData = createValidCreateUserDTO();
      mockRequest.body = {
        email: userData.email,
        password: userData.password,
        fulll_name: userData.fullName,
        age: userData.age,
        phone: userData.phone
      };

      const error = new Error('Service error');
      mockUserService.createNewUser.mockRejectedValue(error);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user_123';
      const updateData = createValidUpdateUserDTO();
      mockRequest.params = { id: userId };
      mockRequest.body = {
        email: updateData.email,
        fulll_name: updateData.fullName,
        age: updateData.age,
        phone: updateData.phone,
        isActive: updateData.isActive
      };

      mockUserService.updateExistingUser.mockResolvedValue(mockUserDocument);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.updateExistingUser).toHaveBeenCalledWith(userId, expect.any(UpdateUserDTO));
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockUserDocument,
        SUCCESS_MESSAGES.USER_UPDATED
      );
    });

    it('should handle partial updates', async () => {
      const userId = 'user_123';
      mockRequest.params = { id: userId };
      mockRequest.body = {
        fulll_name: 'Updated Name Only'
      };

      mockUserService.updateExistingUser.mockResolvedValue(mockUserDocument);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.updateExistingUser).toHaveBeenCalledWith(userId, expect.any(UpdateUserDTO));
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockUserDocument,
        SUCCESS_MESSAGES.USER_UPDATED
      );
    });

    it('should handle user not found', async () => {
      const userId = 'nonexistent_user';
      const updateData = createValidUpdateUserDTO();
      mockRequest.params = { id: userId };
      mockRequest.body = {
        email: updateData.email,
        fulll_name: updateData.fullName
      };

      const error = new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      mockUserService.updateExistingUser.mockRejectedValue(error);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle service errors', async () => {
      const userId = 'user_123';
      const updateData = createValidUpdateUserDTO();
      mockRequest.params = { id: userId };
      mockRequest.body = {
        email: updateData.email,
        fulll_name: updateData.fullName
      };

      const error = new Error('Service error');
      mockUserService.updateExistingUser.mockRejectedValue(error);

      await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user_123';
      mockRequest.params = { id: userId };
      mockUserService.removeUser.mockResolvedValue(undefined);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.removeUser).toHaveBeenCalledWith(userId);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        null,
        SUCCESS_MESSAGES.USER_DELETED
      );
    });

    it('should handle user not found', async () => {
      const userId = 'nonexistent_user';
      mockRequest.params = { id: userId };
      const error = new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      mockUserService.removeUser.mockRejectedValue(error);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle service errors', async () => {
      const userId = 'user_123';
      mockRequest.params = { id: userId };
      const error = new Error('Service error');
      mockUserService.removeUser.mockRejectedValue(error);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('assignRoles', () => {
    it('should assign roles successfully', async () => {
      const userId = 'user_123';
      const roleIds = ['role1', 'role2'];
      mockRequest.body = { userId, roleIds };
      mockUserService.assignRolesToUser.mockResolvedValue(mockUserDocument);

      await userController.assignRoles(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.assignRolesToUser).toHaveBeenCalledWith(userId, roleIds);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockUserDocument,
        SUCCESS_MESSAGES.ROLES_ASSIGNED
      );
    });

    it('should handle user not found for role assignment', async () => {
      const userId = 'nonexistent_user';
      const roleIds = ['role1', 'role2'];
      mockRequest.body = { userId, roleIds };
      const error = new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      mockUserService.assignRolesToUser.mockRejectedValue(error);

      await userController.assignRoles(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle roles not found', async () => {
      const userId = 'user_123';
      const roleIds = ['nonexistent_role'];
      mockRequest.body = { userId, roleIds };
      const error = new Error(ERROR_MESSAGES.ROLE_NOT_FOUND);
      mockUserService.assignRolesToUser.mockRejectedValue(error);

      await userController.assignRoles(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle service errors', async () => {
      const userId = 'user_123';
      const roleIds = ['role1', 'role2'];
      mockRequest.body = { userId, roleIds };
      const error = new Error('Service error');
      mockUserService.assignRolesToUser.mockRejectedValue(error);

      await userController.assignRoles(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleUserStatus', () => {
    it('should activate user successfully', async () => {
      const userId = 'user_123';
      const activatedUser = { ...mockUserDocument, isActive: true };
      mockRequest.params = { id: userId };
      mockUserService.toggleUserActiveStatus.mockResolvedValue(activatedUser);

      await userController.toggleUserStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.toggleUserActiveStatus).toHaveBeenCalledWith(userId);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        activatedUser,
        SUCCESS_MESSAGES.USER_ACTIVATED
      );
    });

    it('should deactivate user successfully', async () => {
      const userId = 'user_123';
      const deactivatedUser = { ...mockUserDocument, isActive: false };
      mockRequest.params = { id: userId };
      mockUserService.toggleUserActiveStatus.mockResolvedValue(deactivatedUser);

      await userController.toggleUserStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.toggleUserActiveStatus).toHaveBeenCalledWith(userId);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        deactivatedUser,
        SUCCESS_MESSAGES.USER_DEACTIVATED
      );
    });

    it('should handle user not found for status toggle', async () => {
      const userId = 'nonexistent_user';
      mockRequest.params = { id: userId };
      const error = new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      mockUserService.toggleUserActiveStatus.mockRejectedValue(error);

      await userController.toggleUserStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle service errors', async () => {
      const userId = 'user_123';
      mockRequest.params = { id: userId };
      const error = new Error('Service error');
      mockUserService.toggleUserActiveStatus.mockRejectedValue(error);

      await userController.toggleUserStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});