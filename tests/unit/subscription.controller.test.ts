import { Request, Response } from 'express';
import { SubscriptionController } from '../../src/controllers/subscription.controller';
import { subscriptionService } from '../../src/services/subscriptionService';

jest.mock('../../src/services/subscriptionService');

const mockedSubscriptionService = subscriptionService as jest.Mocked<typeof subscriptionService>;

describe('SubscriptionController', () => {
  let subscriptionController: SubscriptionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    subscriptionController = new SubscriptionController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getUserSubscription', () => {
    it('should get user subscription successfully', async () => {
      mockRequest.params = { userId: 'user-id' };

      const mockSubscription = {
        id: 'sub-id',
        userId: 'user-id',
        subscriptions: [{ membershipId: 'mem-id', startDate: new Date() }]
      };

      mockedSubscriptionService.findSubscriptionByUserId.mockResolvedValue(mockSubscription as any);

      await subscriptionController.getUserSubscription(mockRequest as Request, mockResponse as Response);

      expect(mockedSubscriptionService.findSubscriptionByUserId).toHaveBeenCalledWith('user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSubscription);
    });

    it('should handle subscription not found', async () => {
      mockRequest.params = { userId: 'non-existent' };

      const error = new Error('Subscription not found');
      mockedSubscriptionService.findSubscriptionByUserId.mockRejectedValue(error);

      await subscriptionController.getUserSubscription(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addMembershipToSubscription', () => {
    it('should add membership to subscription successfully', async () => {
      mockRequest.params = { userId: 'user-id' };
      mockRequest.body = { membershipId: 'membership-id' };

      const mockUpdatedSubscription = {
        id: 'sub-id',
        userId: 'user-id',
        subscriptions: [{ membershipId: 'membership-id', startDate: new Date() }]
      };

      mockedSubscriptionService.addMembershipToUserSubscription.mockResolvedValue(mockUpdatedSubscription as any);

      await subscriptionController.addMembershipToSubscription(mockRequest as Request, mockResponse as Response);

      expect(mockedSubscriptionService.addMembershipToUserSubscription).toHaveBeenCalledWith('user-id', 'membership-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});