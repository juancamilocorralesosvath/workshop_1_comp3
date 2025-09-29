import { Request, Response } from 'express';
import { SubscriptionController } from '../../../src/controllers/subscription.controller';
import { subscriptionService } from '../../../src/services/subscriptionService';
import { ERROR_MESSAGES } from '../../../src/utils/errorMessages';

jest.mock('../../../src/services/subscriptionService', () => ({
  subscriptionService: {
    findSubscriptionByUserId: jest.fn(),
    createSubscriptionForUser: jest.fn(),
    addMembershipToSubscription: jest.fn(),
  },
}));

describe('SubscriptionController Unit Tests', () => {
  let subscriptionController: SubscriptionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    subscriptionController = new SubscriptionController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    
    jest.clearAllMocks();
  });

  describe('getSubscriptionByUserId', () => {
    beforeEach(() => {
      mockRequest.params = { userId: 'test-user-id' };
    });

    it('should return subscription by userId successfully', async () => {
      const mockSubscription = {
        id: 'subscription-id',
        userId: 'test-user-id',
        memberships: ['membership-1', 'membership-2'],
        isActive: true,
      };

      (subscriptionService.findSubscriptionByUserId as jest.Mock).mockResolvedValue(mockSubscription);

      await subscriptionController.getSubscriptionByUserId(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.findSubscriptionByUserId).toHaveBeenCalledWith('test-user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSubscription);
    });

    it('should return 400 when userId is missing', async () => {
      mockRequest.params = {};

      await subscriptionController.getSubscriptionByUserId(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.findSubscriptionByUserId).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El ID del usuario es requerido.',
      });
    });

    it('should return 400 when userId is empty string', async () => {
      mockRequest.params = { userId: '' };

      await subscriptionController.getSubscriptionByUserId(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.findSubscriptionByUserId).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when subscription not found', async () => {
      (subscriptionService.findSubscriptionByUserId as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND)
      );

      await subscriptionController.getSubscriptionByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND,
      });
    });

    it('should handle service error', async () => {
      const errorMessage = 'Database connection failed';
      (subscriptionService.findSubscriptionByUserId as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await subscriptionController.getSubscriptionByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al obtener la suscripción.',
        error: errorMessage,
      });
    });
  });

  describe('createSubscription', () => {
    beforeEach(() => {
      mockRequest.body = { userId: 'test-user-id' };
    });

    it('should create subscription successfully', async () => {
      const mockCreatedSubscription = {
        id: 'new-subscription-id',
        userId: 'test-user-id',
        memberships: [],
        isActive: true,
      };

      (subscriptionService.createSubscriptionForUser as jest.Mock).mockResolvedValue(mockCreatedSubscription);

      await subscriptionController.createSubscription(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.createSubscriptionForUser).toHaveBeenCalledWith({
        userId: 'test-user-id',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedSubscription);
    });

    it('should return 400 when userId is missing', async () => {
      mockRequest.body = {};

      await subscriptionController.createSubscription(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.createSubscriptionForUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El ID del usuario es requerido.',
      });
    });

    it('should return 400 when userId is empty string', async () => {
      mockRequest.body = { userId: '' };

      await subscriptionController.createSubscription(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.createSubscriptionForUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when user not found', async () => {
      (subscriptionService.createSubscriptionForUser as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.USER_NOT_FOUND)
      );

      await subscriptionController.createSubscription(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    });

    it('should return 409 when subscription already exists', async () => {
      (subscriptionService.createSubscriptionForUser as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.SUBSCRIPTION_ALREADY_EXISTS)
      );

      await subscriptionController.createSubscription(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.SUBSCRIPTION_ALREADY_EXISTS,
      });
    });

    it('should handle service error', async () => {
      const errorMessage = 'Database error';
      (subscriptionService.createSubscriptionForUser as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await subscriptionController.createSubscription(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al crear la suscripción.',
        error: errorMessage,
      });
    });
  });

  describe('addMembership', () => {
    beforeEach(() => {
      mockRequest.params = { id: 'subscription-id' };
      mockRequest.body = { membershipId: 'membership-id' };
    });

    it('should add membership to subscription successfully', async () => {
      const mockUpdatedSubscription = {
        id: 'subscription-id',
        userId: 'test-user-id',
        memberships: ['existing-membership', 'membership-id'],
        isActive: true,
      };

      (subscriptionService.addMembershipToSubscription as jest.Mock).mockResolvedValue(mockUpdatedSubscription);

      await subscriptionController.addMembership(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.addMembershipToSubscription).toHaveBeenCalledWith('subscription-id', {
        membershipId: 'membership-id',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedSubscription);
    });

    it('should return 400 when subscriptionId is missing', async () => {
      mockRequest.params = {};

      await subscriptionController.addMembership(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.addMembershipToSubscription).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El ID de la suscripción es requerido.',
      });
    });

    it('should return 400 when subscriptionId is empty string', async () => {
      mockRequest.params = { id: '' };

      await subscriptionController.addMembership(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.addMembershipToSubscription).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when membershipId is missing', async () => {
      mockRequest.body = {};

      await subscriptionController.addMembership(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.addMembershipToSubscription).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El ID de la membresía es requerido.',
      });
    });

    it('should return 400 when membershipId is empty string', async () => {
      mockRequest.body = { membershipId: '' };

      await subscriptionController.addMembership(mockRequest as Request, mockResponse as Response);

      expect(subscriptionService.addMembershipToSubscription).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when subscription not found', async () => {
      (subscriptionService.addMembershipToSubscription as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND)
      );

      await subscriptionController.addMembership(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND,
      });
    });

    it('should return 404 when membership not found', async () => {
      (subscriptionService.addMembershipToSubscription as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND)
      );

      await subscriptionController.addMembership(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND,
      });
    });

    it('should handle service error', async () => {
      const errorMessage = 'Database error';
      (subscriptionService.addMembershipToSubscription as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await subscriptionController.addMembership(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al añadir la membresía a la suscripción.',
        error: errorMessage,
      });
    });
  });

  describe('Input validation edge cases', () => {
    it('should handle null userId in getSubscriptionByUserId', async () => {
      mockRequest.params = { userId: null as any };

      await subscriptionController.getSubscriptionByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle undefined membershipId in addMembership', async () => {
      mockRequest.params = { id: 'subscription-id' };
      mockRequest.body = { membershipId: undefined };

      await subscriptionController.addMembership(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle whitespace-only userId in createSubscription', async () => {
      mockRequest.body = { userId: '   ' };

      await subscriptionController.createSubscription(mockRequest as Request, mockResponse as Response);

      
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});