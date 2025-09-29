import { Request, Response } from 'express';
import { MembershipController } from '../../src/controllers/membership.controller';
import { membershipService } from '../../src/services/membershipService';

jest.mock('../../src/services/membershipService');

const mockedMembershipService = membershipService as jest.Mocked<typeof membershipService>;

describe('MembershipController', () => {
  let membershipController: MembershipController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    membershipController = new MembershipController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('createMembership', () => {
    it('should create membership successfully', async () => {
      const membershipData = {
        name: 'Premium Plan',
        cost: 100000,
        max_classes_assistance: 20,
        max_gym_assistance: 30,
        duration_months: 3
      };

      mockRequest.body = membershipData;

      const mockCreatedMembership = { id: 'membership-id', ...membershipData };
      mockedMembershipService.createNewMembership.mockResolvedValue(mockCreatedMembership as any);

      await membershipController.createMembership(mockRequest as Request, mockResponse as Response);

      expect(mockedMembershipService.createNewMembership).toHaveBeenCalledWith(membershipData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getAllMemberships', () => {
    it('should get all memberships successfully', async () => {
      const mockMemberships = [
        { id: 'mem-1', name: 'Basic Plan' },
        { id: 'mem-2', name: 'Premium Plan' }
      ];

      mockedMembershipService.findAll.mockResolvedValue(mockMemberships as any);

      await membershipController.getAllMemberships(mockRequest as Request, mockResponse as Response);

      expect(mockedMembershipService.findAll).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMemberships);
    });
  });

  describe('updateMembership', () => {
    it('should update membership successfully', async () => {
      const updateData = { name: 'Updated Plan', cost: 150000 };
      mockRequest.params = { id: 'membership-id' };
      mockRequest.body = updateData;

      const mockUpdatedMembership = { id: 'membership-id', ...updateData };
      mockedMembershipService.updateExistingMembership.mockResolvedValue(mockUpdatedMembership as any);

      await membershipController.updateMembership(mockRequest as Request, mockResponse as Response);

      expect(mockedMembershipService.updateExistingMembership).toHaveBeenCalledWith('membership-id', updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});