import { subscriptionService } from '../../src/services/subscriptionService';
import { Subscription } from '../../src/models/Subscription';
import { generateSubscriptionId } from '../../src/utils/generateId';

jest.mock('../../src/models/Subscription');
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
      mockedGenerateId.mockReturnValue('subscription-id');

      const mockSave = jest.fn().mockResolvedValue(undefined);
      MockedSubscription.mockImplementation(() => ({ save: mockSave } as any));

      await subscriptionService.createSubscriptionForUser(subscriptionData);

      expect(MockedSubscription).toHaveBeenCalledWith({
        id: 'subscription-id',
        userId: 'user-id',
        subscriptions: []
      });
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('findSubscriptionByUserId', () => {
    it('should find subscription by user id', async () => {
      const mockSubscription = { id: 'sub-id', userId: 'user-id', subscriptions: [] };
      MockedSubscription.findOne.mockResolvedValue(mockSubscription as any);

      const result = await subscriptionService.findSubscriptionByUserId('user-id');

      expect(MockedSubscription.findOne).toHaveBeenCalledWith({ userId: 'user-id' });
      expect(result).toEqual(mockSubscription);
    });

    it('should throw error when subscription not found', async () => {
      MockedSubscription.findOne.mockResolvedValue(null);

      await expect(subscriptionService.findSubscriptionByUserId('non-existent')).rejects.toThrow();
    });
  });
});