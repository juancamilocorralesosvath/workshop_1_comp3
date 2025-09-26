import { jest } from '@jest/globals';
import { UserService } from '../../../src/services/userService';
import { User } from '../../../src/models/User';
import { Role } from '../../../src/models/Role';
import { ERROR_MESSAGES, PAGINATION_CONFIG } from '../../../src/config/constants';
import {
  mockUserDocument,
  mockRoleDocument,
  createValidCreateUserDTO,
  createValidUpdateUserDTO
} from '../../fixtures/testData';
import { IUserFilters } from '../../../src/interfaces/IUserService';

// Mock de los modelos
jest.mock('../../../src/models/User');
jest.mock('../../../src/models/Role');
jest.mock('../../../src/utils/generateId', () => ({
  generateUserId: jest.fn().mockReturnValue('user_123456789012'),
}));

const MockedUser = User as jest.MockedClass<typeof User>;
const MockedRole = Role as jest.MockedClass<typeof Role>;

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getAllUsersWithFilters', () => {
    it('should return paginated users successfully', async () => {
      // Arrange
      const filters: IUserFilters = { page: 1, limit: 10 };
      const mockUsers = [mockUserDocument];
      const totalCount = 1;

      MockedUser.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockUsers)
              })
            })
          })
        })
      });
      MockedUser.countDocuments = jest.fn().mockResolvedValue(totalCount);

      // Act
      const result = await userService.getAllUsersWithFilters(filters);

      // Assert
      expect(result).toEqual({
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: totalCount,
          pages: Math.ceil(totalCount / 10)
        }
      });
    });

    it('should apply search filter correctly', async () => {
      // Arrange
      const filters: IUserFilters = { search: 'test', page: 1, limit: 10 };
      const expectedQuery = {
        $or: [
          { fulll_name: { $regex: 'test', $options: 'i' } },
          { email: { $regex: 'test', $options: 'i' } }
        ]
      };

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

      // Act
      await userService.getAllUsersWithFilters(filters);

      // Assert
      expect(MockedUser.find).toHaveBeenCalledWith(expectedQuery);
    });

    it('should apply isActive filter correctly', async () => {
      // Arrange
      const filters: IUserFilters = { isActive: false, page: 1, limit: 10 };
      const expectedQuery = { isActive: false };

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

      // Act
      await userService.getAllUsersWithFilters(filters);

      // Assert
      expect(MockedUser.find).toHaveBeenCalledWith(expectedQuery);
    });

    it('should use default pagination values', async () => {
      // Arrange
      const filters: IUserFilters = {};

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

      // Act
      const result = await userService.getAllUsersWithFilters(filters);

      // Assert
      expect(result.pagination.page).toBe(PAGINATION_CONFIG.DEFAULT_PAGE);
      expect(result.pagination.limit).toBe(PAGINATION_CONFIG.DEFAULT_LIMIT);
    });
  });

  describe('findUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 'user_123';
      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUserDocument)
        })
      });

      // Act
      const result = await userService.findUserById(userId);

      // Assert
      expect(result).toEqual(mockUserDocument);
      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: userId });
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'nonexistent_user';
      MockedUser.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(null)
        })
      });

      // Act & Assert
      await expect(userService.findUserById(userId))
        .rejects
        .toThrow(ERROR_MESSAGES.USER_NOT_FOUND);
    });
  });

  describe('createNewUser', () => {
    it('should create user successfully with default role', async () => {
      // Arrange
      const userData = createValidCreateUserDTO();
      const mockSavedUser = { ...mockUserDocument, save: jest.fn().mockResolvedValue(mockUserDocument) };

      MockedUser.findOne = jest.fn().mockResolvedValue(null); // Email doesn't exist
      MockedRole.findOne = jest.fn().mockResolvedValue(mockRoleDocument); // Default role exists
      MockedUser.mockImplementation(() => mockSavedUser as any);
      MockedUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUserDocument)
        })
      });

      // Act
      const result = await userService.createNewUser(userData);

      // Assert
      expect(result).toEqual(mockUserDocument);
      expect(MockedUser.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(MockedRole.findOne).toHaveBeenCalledWith({ name: 'cliente' });
    });

    it('should create user with specified roles', async () => {
      // Arrange
      const userData = { ...createValidCreateUserDTO(), roleIds: ['role1', 'role2'] };
      const mockSavedUser = { ...mockUserDocument, save: jest.fn().mockResolvedValue(mockUserDocument) };

      MockedUser.findOne = jest.fn().mockResolvedValue(null);
      MockedRole.find = jest.fn().mockResolvedValue([mockRoleDocument, mockRoleDocument]);
      MockedUser.mockImplementation(() => mockSavedUser as any);
      MockedUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUserDocument)
        })
      });

      // Act
      const result = await userService.createNewUser(userData);

      // Assert
      expect(result).toEqual(mockUserDocument);
      expect(MockedRole.find).toHaveBeenCalledWith({ _id: { $in: userData.roleIds } });
    });

    it('should throw error when email already exists', async () => {
      // Arrange
      const userData = createValidCreateUserDTO();
      MockedUser.findOne = jest.fn().mockResolvedValue(mockUserDocument);

      // Act & Assert
      await expect(userService.createNewUser(userData))
        .rejects
        .toThrow(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    });

    it('should throw error when specified roles not found', async () => {
      // Arrange
      const userData = { ...createValidCreateUserDTO(), roleIds: ['role1', 'role2'] };
      MockedUser.findOne = jest.fn().mockResolvedValue(null);
      MockedRole.find = jest.fn().mockResolvedValue([mockRoleDocument]); // Only one role found

      // Act & Assert
      await expect(userService.createNewUser(userData))
        .rejects
        .toThrow(ERROR_MESSAGES.ROLE_NOT_FOUND);
    });
  });

  describe('updateExistingUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user_123';
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

      // Act
      const result = await userService.updateExistingUser(userId, updateData);

      // Assert
      expect(result).toEqual(mockUserDocument);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'nonexistent_user';
      const updateData = createValidUpdateUserDTO();
      MockedUser.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateExistingUser(userId, updateData))
        .rejects
        .toThrow(ERROR_MESSAGES.USER_NOT_FOUND);
    });

    it('should validate email uniqueness when updating email', async () => {
      // Arrange
      const userId = 'user_123';
      const updateData = { ...createValidUpdateUserDTO(), email: 'newemail@example.com' };
      const mockUser = {
        ...mockUserDocument,
        email: 'oldemail@example.com',
        save: jest.fn().mockResolvedValue(mockUserDocument)
      };

      MockedUser.findOne
        .mockResolvedValueOnce(mockUser) // First call for finding user
        .mockResolvedValueOnce(mockUserDocument); // Second call for email validation

      // Act & Assert
      await expect(userService.updateExistingUser(userId, updateData))
        .rejects
        .toThrow(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    });
  });

  describe('removeUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 'user_123';
      MockedUser.findOne = jest.fn().mockResolvedValue(mockUserDocument);
      MockedUser.findByIdAndDelete = jest.fn().mockResolvedValue(mockUserDocument);

      // Act
      await userService.removeUser(userId);

      // Assert
      expect(MockedUser.findByIdAndDelete).toHaveBeenCalledWith(mockUserDocument._id);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'nonexistent_user';
      MockedUser.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(userService.removeUser(userId))
        .rejects
        .toThrow(ERROR_MESSAGES.USER_NOT_FOUND);
    });
  });

  describe('assignRolesToUser', () => {
    it('should assign roles to user successfully', async () => {
      // Arrange
      const userId = 'user_123';
      const roleIds = ['role1', 'role2'];
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

      // Act
      const result = await userService.assignRolesToUser(userId, roleIds);

      // Assert
      expect(result).toEqual(mockUserDocument);
      expect(mockUser.rol).toEqual(roleIds);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error when roles not found', async () => {
      // Arrange
      const userId = 'user_123';
      const roleIds = ['role1', 'role2'];
      MockedUser.findOne = jest.fn().mockResolvedValue(mockUserDocument);
      MockedRole.find = jest.fn().mockResolvedValue([mockRoleDocument]); // Only one role found

      // Act & Assert
      await expect(userService.assignRolesToUser(userId, roleIds))
        .rejects
        .toThrow(ERROR_MESSAGES.ROLE_NOT_FOUND);
    });
  });

  describe('toggleUserActiveStatus', () => {
    it('should toggle user status successfully', async () => {
      // Arrange
      const userId = 'user_123';
      const mockUser = {
        ...mockUserDocument,
        isActive: true,
        save: jest.fn().mockResolvedValue(mockUserDocument)
      };
      const expectedUpdatedUser = { ...mockUserDocument, isActive: false };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);
      MockedUser.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(expectedUpdatedUser)
        })
      });

      // Act
      const result = await userService.toggleUserActiveStatus(userId);

      // Assert
      expect(mockUser.isActive).toBe(false);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(expectedUpdatedUser);
    });
  });
});