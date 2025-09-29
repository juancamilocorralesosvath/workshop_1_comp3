import { subscriptionService } from '../../src/services/subscriptionService';
import { Subscription } from '../../src/models/Subscription';
import { generateSubscriptionId } from '../../src/utils/generateId';

jest.mock('../../src/models/Subscription');
jest.mock('../../src/models/User');
jest.mock('../../src/utils/generateId');

const MockedSubscription = Subscription as jest.Mocked<typeof Subscription>;
const mockedGenerateId = generateSubscriptionId as jest.MockedFunction<typeof generateSubscriptionId>;

describe('SubscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSubscriptionForUser', () => {
    it('should create subscription successfully', async () => {
      const subscriptionData = { userId: 'user-id' };
      const mockUser = { _id: 'mongo-user-id', id: 'user-id' };
      const mockSubscription = { id: 'subscription-id', user_id: 'mongo-user-id', memberships: [] };

      mockedGenerateId.mockReturnValue('subscription-id');

      // Mock User.findOne
      const MockedUser = require('../../src/models/User').User as jest.Mocked<any>;
      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);

      // Mock existing subscription check
      MockedSubscription.findOne.mockResolvedValue(null);

      const mockSave = jest.fn().mockResolvedValue(mockSubscription);
      (MockedSubscription as any).mockImplementation(() => ({ save: mockSave }));

      const result = await subscriptionService.createSubscriptionForUser(subscriptionData);

      expect(MockedSubscription).toHaveBeenCalledWith({
        id: 'subscription-id',
        user_id: 'mongo-user-id',
        memberships: []
      });
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('findSubscriptionByUserId', () => {
    it('should find subscription by user id', async () => {
      const mockUser = { _id: 'mongo-user-id', id: 'user-id' };
      const mockSubscription = { id: 'sub-id', user_id: 'mongo-user-id', memberships: [] };

      const MockedUser = require('../../src/models/User').User as jest.Mocked<any>;
      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);

      MockedSubscription.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSubscription)
      } as any);

      const result = await subscriptionService.findSubscriptionByUserId('user-id');

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'user-id' });
      expect(MockedSubscription.findOne).toHaveBeenCalledWith({ user_id: 'mongo-user-id' });
      expect(result).toEqual(mockSubscription);
    });

    it('should throw error when user not found', async () => {
      const MockedUser = require('../../src/models/User').User as jest.Mocked<any>;
      MockedUser.findOne = jest.fn().mockResolvedValue(null);

      await expect(subscriptionService.findSubscriptionByUserId('non-existent')).rejects.toThrow();
    });

    it('should throw error when subscription not found', async () => {
      const mockUser = { _id: 'mongo-user-id', id: 'user-id' };
      const MockedUser = require('../../src/models/User').User as jest.Mocked<any>;
      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);

      MockedSubscription.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      } as any);

      await expect(subscriptionService.findSubscriptionByUserId('user-id')).rejects.toThrow();
    });
  });
});