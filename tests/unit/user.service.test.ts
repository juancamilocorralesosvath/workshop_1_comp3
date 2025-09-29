import { userService } from '../../src/services/userService';
import { User } from '../../src/models/User';

jest.mock('../../src/models/User');

const MockedUser = User as jest.Mocked<typeof User>;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserById', () => {
    it('should find user by id successfully', async () => {
      const mockUser = { id: 'user-id', email: 'test@test.com', full_name: 'Test User' };
      MockedUser.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUser)
        })
      } as any);

      const result = await userService.findUserById('user-id');

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'user-id' });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      MockedUser.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(null)
        })
      } as any);

      await expect(userService.findUserById('non-existent')).rejects.toThrow();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser = {
        id: 'user-id',
        full_name: 'Old Name',
        save: jest.fn().mockResolvedValue(undefined)
      };
      const updateData = { full_name: 'New Name', age: 30 };

      MockedUser.findOne.mockResolvedValue(mockUser as any);

      const result = await userService.updateUserProfile('user-id', updateData);

      expect(mockUser.full_name).toBe('New Name');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });
  });
});