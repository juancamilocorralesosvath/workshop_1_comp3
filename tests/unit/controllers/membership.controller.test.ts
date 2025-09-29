import { Request, Response } from 'express';
import { MembershipController } from '../../../src/controllers/membership.controller';
import { membershipService } from '../../../src/services/membershipService';
import { ERROR_MESSAGES } from '../../../src/utils/errorMessages';

jest.mock('../../../src/services/membershipService', () => ({
  membershipService: {
    findAll: jest.fn(),
    findMembershipById: jest.fn(),
    createNewMembership: jest.fn(),
    updateExistingMembership: jest.fn(),
    removeMembership: jest.fn(),
    toggleMembershipStatus: jest.fn(),
  },
}));

describe('MembershipController Unit Tests', () => {
  let membershipController: MembershipController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    membershipController = new MembershipController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    
    jest.clearAllMocks();
  });

  describe('getAllMemberships', () => {
    it('should return all memberships successfully', async () => {
      const mockMemberships = [
        { id: '1', name: 'Basic', price: 50000 },
        { id: '2', name: 'Premium', price: 80000 },
      ];

      (membershipService.findAll as jest.Mock).mockResolvedValue(mockMemberships);

      await membershipController.getAllMemberships(mockRequest as Request, mockResponse as Response);

      expect(membershipService.findAll).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMemberships);
    });

    it('should handle service error', async () => {
      const errorMessage = 'Database connection failed';
      (membershipService.findAll as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await membershipController.getAllMemberships(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error retrieving memberships',
        error: errorMessage,
      });
    });
  });

  describe('getMembershipById', () => {
    beforeEach(() => {
      mockRequest.params = { id: 'test-membership-id' };
    });

    it('should return membership by id successfully', async () => {
      const mockMembership = { id: 'test-membership-id', name: 'Premium', price: 80000 };
      (membershipService.findMembershipById as jest.Mock).mockResolvedValue(mockMembership);

      await membershipController.getMembershipById(mockRequest as Request, mockResponse as Response);

      expect(membershipService.findMembershipById).toHaveBeenCalledWith('test-membership-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMembership);
    });

    it('should return 400 when id is missing', async () => {
      mockRequest.params = {};

      await membershipController.getMembershipById(mockRequest as Request, mockResponse as Response);

      expect(membershipService.findMembershipById).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Membership ID is required',
      });
    });

    it('should return 404 when membership not found', async () => {
      (membershipService.findMembershipById as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND)
      );

      await membershipController.getMembershipById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND,
      });
    });

    it('should handle service error', async () => {
      const errorMessage = 'Database error';
      (membershipService.findMembershipById as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await membershipController.getMembershipById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error retrieving membership',
        error: errorMessage,
      });
    });
  });

  describe('createMembership', () => {
    beforeEach(() => {
      mockRequest.body = {
        name: 'New Membership',
        description: 'Test description',
        price: 60000,
        duration_days: 30,
      };
    });

    it('should create membership successfully', async () => {
      const mockCreatedMembership = { id: 'new-id', ...mockRequest.body };
      (membershipService.createNewMembership as jest.Mock).mockResolvedValue(mockCreatedMembership);

      await membershipController.createMembership(mockRequest as Request, mockResponse as Response);

      expect(membershipService.createNewMembership).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedMembership);
    });

    it('should return 409 when membership name already exists', async () => {
      (membershipService.createNewMembership as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.MEMBERSHIP_NAME_ALREADY_EXISTS)
      );

      await membershipController.createMembership(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.MEMBERSHIP_NAME_ALREADY_EXISTS,
      });
    });

    it('should handle service error', async () => {
      const errorMessage = 'Creation failed';
      (membershipService.createNewMembership as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await membershipController.createMembership(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error creating membership',
        error: errorMessage,
      });
    });
  });

  describe('updateMembership', () => {
    beforeEach(() => {
      mockRequest.params = { id: 'test-membership-id' };
      mockRequest.body = {
        name: 'Updated Membership',
        price: 70000,
      };
    });

    it('should update membership successfully', async () => {
      const mockUpdatedMembership = { id: 'test-membership-id', ...mockRequest.body };
      (membershipService.updateExistingMembership as jest.Mock).mockResolvedValue(mockUpdatedMembership);

      await membershipController.updateMembership(mockRequest as Request, mockResponse as Response);

      expect(membershipService.updateExistingMembership).toHaveBeenCalledWith('test-membership-id', mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedMembership);
    });

    it('should return 400 when id is missing', async () => {
      mockRequest.params = {};

      await membershipController.updateMembership(mockRequest as Request, mockResponse as Response);

      expect(membershipService.updateExistingMembership).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when membership not found', async () => {
      (membershipService.updateExistingMembership as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND)
      );

      await membershipController.updateMembership(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 409 when membership name already exists', async () => {
      (membershipService.updateExistingMembership as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.MEMBERSHIP_NAME_ALREADY_EXISTS)
      );

      await membershipController.updateMembership(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
    });
  });

  describe('deleteMembership', () => {
    beforeEach(() => {
      mockRequest.params = { id: 'test-membership-id' };
    });

    it('should delete membership successfully', async () => {
      (membershipService.removeMembership as jest.Mock).mockResolvedValue(undefined);

      await membershipController.deleteMembership(mockRequest as Request, mockResponse as Response);

      expect(membershipService.removeMembership).toHaveBeenCalledWith('test-membership-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should return 400 when id is missing', async () => {
      mockRequest.params = {};

      await membershipController.deleteMembership(mockRequest as Request, mockResponse as Response);

      expect(membershipService.removeMembership).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when membership not found', async () => {
      (membershipService.removeMembership as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND)
      );

      await membershipController.deleteMembership(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('toggleMembershipStatus', () => {
    beforeEach(() => {
      mockRequest.params = { id: 'test-membership-id' };
    });

    it('should toggle membership status successfully', async () => {
      const mockToggledMembership = { id: 'test-membership-id', isActive: false };
      (membershipService.toggleMembershipStatus as jest.Mock).mockResolvedValue(mockToggledMembership);

      await membershipController.toggleMembershipStatus(mockRequest as Request, mockResponse as Response);

      expect(membershipService.toggleMembershipStatus).toHaveBeenCalledWith('test-membership-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockToggledMembership);
    });

    it('should return 400 when id is missing', async () => {
      mockRequest.params = {};

      await membershipController.toggleMembershipStatus(mockRequest as Request, mockResponse as Response);

      expect(membershipService.toggleMembershipStatus).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when membership not found', async () => {
      (membershipService.toggleMembershipStatus as jest.Mock).mockRejectedValue(
        new Error(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND)
      );

      await membershipController.toggleMembershipStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});