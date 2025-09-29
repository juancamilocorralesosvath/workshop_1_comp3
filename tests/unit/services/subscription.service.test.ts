import { subscriptionService } from '../../../src/services/subscriptionService';
import { Subscription } from '../../../src/models/Subscription';
import { Membership } from '../../../src/models/Membership';
import { User } from '../../../src/models/User';
import { generateSubscriptionId } from '../../../src/utils/generateId';
import { ERROR_MESSAGES } from '../../../src/utils/errorMessages';

jest.mock('../../../src/models/Subscription');
jest.mock('../../../src/models/Membership');
jest.mock('../../../src/models/User');
jest.mock('../../../src/utils/generateId');

const MockedSubscription = Subscription as jest.Mocked<typeof Subscription>;
const MockedMembership = Membership as jest.Mocked<typeof Membership>;
const MockedUser = User as jest.Mocked<typeof User>;
const mockedGenerateSubscriptionId = generateSubscriptionId as jest.MockedFunction<typeof generateSubscriptionId>;

describe('SubscriptionService Unit Tests', () => {
  let mockUser: any;
  let mockMembership: any;
  let mockSubscription: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: 'mongodb-user-id',
      id: 'test-user-id',
      full_name: 'Test User',
      email: 'test@example.com',
    };

    mockMembership = {
      _id: 'mongodb-membership-id',
      id: 'test-membership-id',
      name: 'Premium Membership',
      cost: 80000,
      max_classes_assistance: 20,
      max_gym_assistance: 30,
      duration_months: 1,
    };

    mockSubscription = {
      _id: 'mongodb-subscription-id',
      id: 'test-subscription-id',
      user_id: mockUser._id,
      memberships: [],
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockReturnThis(),
    };
  });

  describe('findSubscriptionByUserId', () => {
    it('should return subscription when user and subscription exist', async () => {
      MockedUser.findOne.mockResolvedValue(mockUser);
      const mockPopulatedSubscription = { ...mockSubscription };
      mockPopulatedSubscription.populate = jest.fn().mockResolvedValue(mockPopulatedSubscription);
      MockedSubscription.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPopulatedSubscription),
      } as any);

      const result = await subscriptionService.findSubscriptionByUserId('test-user-id');

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'test-user-id' });
      expect(MockedSubscription.findOne).toHaveBeenCalledWith({ user_id: mockUser._id });
      expect(result).toEqual(mockPopulatedSubscription);
    });

    it('should throw error when user not found', async () => {
      MockedUser.findOne.mockResolvedValue(null);

      await expect(subscriptionService.findSubscriptionByUserId('non-existent-user')).rejects.toThrow(
        ERROR_MESSAGES.USER_NOT_FOUND
      );

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'non-existent-user' });
      expect(MockedSubscription.findOne).not.toHaveBeenCalled();
    });

    it('should throw error when subscription not found', async () => {
      MockedUser.findOne.mockResolvedValue(mockUser);
      MockedSubscription.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(subscriptionService.findSubscriptionByUserId('test-user-id')).rejects.toThrow(
        ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND
      );

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'test-user-id' });
      expect(MockedSubscription.findOne).toHaveBeenCalledWith({ user_id: mockUser._id });
    });

    it('should handle database errors', async () => {
      MockedUser.findOne.mockRejectedValue(new Error('Database connection failed'));

      await expect(subscriptionService.findSubscriptionByUserId('test-user-id')).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('createSubscriptionForUser', () => {
    beforeEach(() => {
      mockedGenerateSubscriptionId.mockReturnValue('generated-subscription-id');
      MockedSubscription.prototype.save = jest.fn().mockResolvedValue(undefined);
    });

    it('should create subscription for user successfully', async () => {
      MockedUser.findOne.mockResolvedValue(mockUser);
      MockedSubscription.findOne.mockResolvedValue(null); 

      const result = await subscriptionService.createSubscriptionForUser({ userId: 'test-user-id' });

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'test-user-id' });
      expect(MockedSubscription.findOne).toHaveBeenCalledWith({ user_id: mockUser._id });
      expect(mockedGenerateSubscriptionId).toHaveBeenCalled();
      expect(MockedSubscription).toHaveBeenCalledWith({
        id: 'generated-subscription-id',
        user_id: mockUser._id,
        memberships: [],
      });
      expect(result).toBeDefined();
    });

    it('should throw error when user not found', async () => {
      MockedUser.findOne.mockResolvedValue(null);

      await expect(subscriptionService.createSubscriptionForUser({ userId: 'non-existent-user' })).rejects.toThrow(
        ERROR_MESSAGES.USER_NOT_FOUND
      );

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'non-existent-user' });
      expect(MockedSubscription.findOne).not.toHaveBeenCalled();
      expect(MockedSubscription).not.toHaveBeenCalled();
    });

    it('should throw error when subscription already exists', async () => {
      MockedUser.findOne.mockResolvedValue(mockUser);
      MockedSubscription.findOne.mockResolvedValue(mockSubscription); 

      await expect(subscriptionService.createSubscriptionForUser({ userId: 'test-user-id' })).rejects.toThrow(
        ERROR_MESSAGES.SUBSCRIPTION_ALREADY_EXISTS
      );

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'test-user-id' });
      expect(MockedSubscription.findOne).toHaveBeenCalledWith({ user_id: mockUser._id });
      expect(MockedSubscription).not.toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      MockedUser.findOne.mockResolvedValue(mockUser);
      MockedSubscription.findOne.mockResolvedValue(null);
      MockedSubscription.prototype.save.mockRejectedValue(new Error('Save failed'));

      await expect(subscriptionService.createSubscriptionForUser({ userId: 'test-user-id' })).rejects.toThrow(
        'Save failed'
      );
    });
  });

  describe('addMembershipToSubscription', () => {
    let mockUpdatedSubscription: any;

    beforeEach(() => {
      mockUpdatedSubscription = {
        ...mockSubscription,
        memberships: [
          {
            membership_id: mockMembership.id,
            name: mockMembership.name,
            cost: mockMembership.cost,
            max_classes_assistance: mockMembership.max_classes_assistance,
            max_gym_assistance: mockMembership.max_gym_assistance,
            duration_months: mockMembership.duration_months,
            purchase_date: expect.any(Date),
          },
        ],
      };
    });

    it('should add membership to subscription successfully', async () => {
      MockedMembership.findOne.mockResolvedValue(mockMembership);
      MockedSubscription.findOneAndUpdate.mockResolvedValue(mockUpdatedSubscription);

      const result = await subscriptionService.addMembershipToSubscription('test-subscription-id', {
        membershipId: 'test-membership-id',
      });

      expect(MockedMembership.findOne).toHaveBeenCalledWith({ id: 'test-membership-id' });
      expect(MockedSubscription.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'test-subscription-id' },
        {
          $push: {
            memberships: {
              membership_id: mockMembership.id,
              name: mockMembership.name,
              cost: mockMembership.cost,
              max_classes_assistance: mockMembership.max_classes_assistance,
              max_gym_assistance: mockMembership.max_gym_assistance,
              duration_months: mockMembership.duration_months,
              purchase_date: expect.any(Date),
            },
          },
        },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedSubscription);
    });

    it('should throw error when membership not found', async () => {
      MockedMembership.findOne.mockResolvedValue(null);

      await expect(
        subscriptionService.addMembershipToSubscription('test-subscription-id', {
          membershipId: 'non-existent-membership',
        })
      ).rejects.toThrow(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND);

      expect(MockedMembership.findOne).toHaveBeenCalledWith({ id: 'non-existent-membership' });
      expect(MockedSubscription.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw error when subscription not found', async () => {
      MockedMembership.findOne.mockResolvedValue(mockMembership);
      MockedSubscription.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        subscriptionService.addMembershipToSubscription('non-existent-subscription', {
          membershipId: 'test-membership-id',
        })
      ).rejects.toThrow(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);

      expect(MockedMembership.findOne).toHaveBeenCalledWith({ id: 'test-membership-id' });
      expect(MockedSubscription.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'non-existent-subscription' },
        expect.any(Object),
        { new: true }
      );
    });

    it('should create correct historic entry structure', async () => {
      MockedMembership.findOne.mockResolvedValue(mockMembership);
      MockedSubscription.findOneAndUpdate.mockResolvedValue(mockUpdatedSubscription);

      await subscriptionService.addMembershipToSubscription('test-subscription-id', {
        membershipId: 'test-membership-id',
      });

      const expectedHistoricEntry = {
        membership_id: mockMembership.id,
        name: mockMembership.name,
        cost: mockMembership.cost,
        max_classes_assistance: mockMembership.max_classes_assistance,
        max_gym_assistance: mockMembership.max_gym_assistance,
        duration_months: mockMembership.duration_months,
        purchase_date: expect.any(Date),
      };

      expect(MockedSubscription.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'test-subscription-id' },
        { $push: { memberships: expectedHistoricEntry } },
        { new: true }
      );
    });

    it('should handle database errors during membership lookup', async () => {
      MockedMembership.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        subscriptionService.addMembershipToSubscription('test-subscription-id', {
          membershipId: 'test-membership-id',
        })
      ).rejects.toThrow('Database error');

      expect(MockedSubscription.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('should handle database errors during subscription update', async () => {
      MockedMembership.findOne.mockResolvedValue(mockMembership);
      MockedSubscription.findOneAndUpdate.mockRejectedValue(new Error('Update failed'));

      await expect(
        subscriptionService.addMembershipToSubscription('test-subscription-id', {
          membershipId: 'test-membership-id',
        })
      ).rejects.toThrow('Update failed');
    });

    it('should set purchase_date to current date', async () => {
      const beforeTest = new Date();
      MockedMembership.findOne.mockResolvedValue(mockMembership);
      MockedSubscription.findOneAndUpdate.mockResolvedValue(mockUpdatedSubscription);

      await subscriptionService.addMembershipToSubscription('test-subscription-id', {
        membershipId: 'test-membership-id',
      });

      const afterTest = new Date();
      const call = MockedSubscription.findOneAndUpdate.mock.calls[0];
      const pushOperation = call[1].$push.memberships;
      const purchaseDate = pushOperation.purchase_date;

      expect(purchaseDate).toBeInstanceOf(Date);
      expect(purchaseDate.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
      expect(purchaseDate.getTime()).toBeLessThanOrEqual(afterTest.getTime());
    });
  });
});