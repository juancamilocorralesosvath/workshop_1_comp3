import { membershipService } from '../../../src/services/membershipService';
import { Membership } from '../../../src/models/Membership';
import { generateMembershipId } from '../../../src/utils/generateId';
import { ERROR_MESSAGES } from '../../../src/utils/errorMessages';

// Mock dependencies
jest.mock('../../../src/models/Membership');
jest.mock('../../../src/utils/generateId');

const MockedMembership = Membership as jest.Mocked<typeof Membership>;
const mockedGenerateMembershipId = generateMembershipId as jest.MockedFunction<typeof generateMembershipId>;

describe('MembershipService Unit Tests', () => {
  let mockMembershipData: any;
  let mockMembership: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMembershipData = {
      name: 'Test Membership',
      cost: 50000,
      status: true,
      max_classes_assistance: 10,
      max_gym_assistance: 30,
      duration_months: 1,
    };

    mockMembership = {
      id: 'test-membership-id',
      _id: 'mongodb-object-id',
      name: 'Test Membership',
      cost: 50000,
      status: true,
      save: jest.fn().mockResolvedValue(undefined),
      ...mockMembershipData,
    };
  });

  describe('findMembershipById', () => {
    it('should return membership when found', async () => {
      MockedMembership.findOne.mockResolvedValue(mockMembership);

      const result = await membershipService.findMembershipById('test-membership-id');

      expect(MockedMembership.findOne).toHaveBeenCalledWith({ id: 'test-membership-id' });
      expect(result).toEqual(mockMembership);
    });

    it('should throw error when membership not found', async () => {
      MockedMembership.findOne.mockResolvedValue(null);

      await expect(membershipService.findMembershipById('non-existent-id')).rejects.toThrow(
        ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND
      );

      expect(MockedMembership.findOne).toHaveBeenCalledWith({ id: 'non-existent-id' });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      MockedMembership.findOne.mockRejectedValue(dbError);

      await expect(membershipService.findMembershipById('test-id')).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('findAll', () => {
    it('should return all memberships', async () => {
      const mockMemberships = [mockMembership, { ...mockMembership, id: 'test-2' }];
      MockedMembership.find.mockResolvedValue(mockMemberships);

      const result = await membershipService.findAll();

      expect(MockedMembership.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockMemberships);
    });

    it('should return empty array when no memberships exist', async () => {
      MockedMembership.find.mockResolvedValue([]);

      const result = await membershipService.findAll();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      MockedMembership.find.mockRejectedValue(dbError);

      await expect(membershipService.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('createNewMembership', () => {
    beforeEach(() => {
      mockedGenerateMembershipId.mockReturnValue('generated-membership-id');
      MockedMembership.findOne.mockResolvedValue(null); // No existing membership
      MockedMembership.prototype.save = jest.fn().mockResolvedValue(undefined);
      MockedMembership.findOne.mockImplementation((query: any) => {
        if (query.name) return Promise.resolve(null); // For uniqueness check
        if (query.id) return Promise.resolve(mockMembership); // For final return
        return Promise.resolve(null);
      });
    });

    it('should create new membership successfully', async () => {
      const result = await membershipService.createNewMembership(mockMembershipData);

      expect(MockedMembership.findOne).toHaveBeenCalledWith({ name: mockMembershipData.name });
      expect(mockedGenerateMembershipId).toHaveBeenCalled();
      expect(MockedMembership).toHaveBeenCalledWith({
        id: 'generated-membership-id',
        name: mockMembershipData.name,
        cost: mockMembershipData.cost,
        status: mockMembershipData.status,
        max_classes_assistance: mockMembershipData.max_classes_assistance,
        max_gym_assistance: mockMembershipData.max_gym_assistance,
        duration_months: mockMembershipData.duration_months,
      });
    });

    it('should set default status to true when not provided', async () => {
      const dataWithoutStatus = { ...mockMembershipData };
      delete dataWithoutStatus.status;

      await membershipService.createNewMembership(dataWithoutStatus);

      expect(MockedMembership).toHaveBeenCalledWith({
        id: 'generated-membership-id',
        name: dataWithoutStatus.name,
        cost: dataWithoutStatus.cost,
        status: true, // Default value
        max_classes_assistance: dataWithoutStatus.max_classes_assistance,
        max_gym_assistance: dataWithoutStatus.max_gym_assistance,
        duration_months: dataWithoutStatus.duration_months,
      });
    });

    it('should throw error when name already exists', async () => {
      MockedMembership.findOne.mockImplementation((query: any) => {
        if (query.name) return Promise.resolve(mockMembership); // Existing membership
        return Promise.resolve(null);
      });

      await expect(membershipService.createNewMembership(mockMembershipData)).rejects.toThrow(
        ERROR_MESSAGES.MEMBERSHIP_NAME_ALREADY_EXISTS
      );
    });

    it('should handle save errors', async () => {
      const saveError = new Error('Save failed');
      MockedMembership.prototype.save.mockRejectedValue(saveError);

      await expect(membershipService.createNewMembership(mockMembershipData)).rejects.toThrow('Save failed');
    });
  });

  describe('updateExistingMembership', () => {
    let updateData: any;

    beforeEach(() => {
      updateData = {
        name: 'Updated Membership',
        cost: 60000,
      };

      MockedMembership.findOne.mockImplementation((query: any) => {
        if (query.id === 'test-membership-id') return Promise.resolve(mockMembership);
        if (query.name === updateData.name) return Promise.resolve(null); // No name conflict
        return Promise.resolve(null);
      });
    });

    it('should update membership successfully', async () => {
      const result = await membershipService.updateExistingMembership('test-membership-id', updateData);

      expect(MockedMembership.findOne).toHaveBeenCalledWith({ id: 'test-membership-id' });
      expect(mockMembership.save).toHaveBeenCalled();
      expect(mockMembership.name).toBe(updateData.name);
      expect(mockMembership.cost).toBe(updateData.cost);
    });

    it('should not check name uniqueness if name unchanged', async () => {
      const sameNameUpdate = { cost: 60000 };

      await membershipService.updateExistingMembership('test-membership-id', sameNameUpdate);

      expect(MockedMembership.findOne).toHaveBeenCalledTimes(2); // Once for find entity, once for final result
    });

    it('should throw error when updating to existing name', async () => {
      const existingMembership = { ...mockMembership, id: 'other-id', name: 'Other Membership' };
      MockedMembership.findOne.mockImplementation((query: any) => {
        if (query.id === 'test-membership-id') return Promise.resolve(mockMembership);
        if (query.name === updateData.name) return Promise.resolve(existingMembership);
        return Promise.resolve(null);
      });

      await expect(membershipService.updateExistingMembership('test-membership-id', updateData)).rejects.toThrow(
        ERROR_MESSAGES.MEMBERSHIP_NAME_ALREADY_EXISTS
      );
    });

    it('should throw error when membership not found', async () => {
      MockedMembership.findOne.mockResolvedValue(null);

      await expect(membershipService.updateExistingMembership('non-existent-id', updateData)).rejects.toThrow(
        ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND
      );
    });

    it('should handle all update fields', async () => {
      const fullUpdateData = {
        name: 'New Name',
        cost: 70000,
        status: false,
        max_classes_assistance: 15,
        max_gym_assistance: 25,
        duration_months: 2,
      };

      await membershipService.updateExistingMembership('test-membership-id', fullUpdateData);

      expect(mockMembership.name).toBe(fullUpdateData.name);
      expect(mockMembership.cost).toBe(fullUpdateData.cost);
      expect(mockMembership.status).toBe(fullUpdateData.status);
      expect(mockMembership.max_classes_assistance).toBe(fullUpdateData.max_classes_assistance);
      expect(mockMembership.max_gym_assistance).toBe(fullUpdateData.max_gym_assistance);
      expect(mockMembership.duration_months).toBe(fullUpdateData.duration_months);
    });
  });

  describe('removeMembership', () => {
    it('should delete membership successfully', async () => {
      MockedMembership.findOne.mockResolvedValue(mockMembership);
      MockedMembership.findByIdAndDelete.mockResolvedValue(mockMembership);

      await membershipService.removeMembership('test-membership-id');

      expect(MockedMembership.findOne).toHaveBeenCalledWith({ id: 'test-membership-id' });
      expect(MockedMembership.findByIdAndDelete).toHaveBeenCalledWith(mockMembership._id);
    });

    it('should throw error when membership not found', async () => {
      MockedMembership.findOne.mockResolvedValue(null);

      await expect(membershipService.removeMembership('non-existent-id')).rejects.toThrow(
        ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND
      );

      expect(MockedMembership.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should handle database deletion errors', async () => {
      MockedMembership.findOne.mockResolvedValue(mockMembership);
      MockedMembership.findByIdAndDelete.mockRejectedValue(new Error('Delete failed'));

      await expect(membershipService.removeMembership('test-membership-id')).rejects.toThrow('Delete failed');
    });
  });

  describe('toggleMembershipStatus', () => {
    it('should toggle status from true to false', async () => {
      const activeMembership = { ...mockMembership, status: true };
      MockedMembership.findOne.mockImplementation((query: any) => {
        if (query.id === 'test-membership-id') return Promise.resolve(activeMembership);
        return Promise.resolve(activeMembership);
      });

      await membershipService.toggleMembershipStatus('test-membership-id');

      expect(activeMembership.status).toBe(false);
      expect(activeMembership.save).toHaveBeenCalled();
    });

    it('should toggle status from false to true', async () => {
      const inactiveMembership = { ...mockMembership, status: false };
      MockedMembership.findOne.mockImplementation((query: any) => {
        if (query.id === 'test-membership-id') return Promise.resolve(inactiveMembership);
        return Promise.resolve(inactiveMembership);
      });

      await membershipService.toggleMembershipStatus('test-membership-id');

      expect(inactiveMembership.status).toBe(true);
      expect(inactiveMembership.save).toHaveBeenCalled();
    });

    it('should throw error when membership not found', async () => {
      MockedMembership.findOne.mockResolvedValue(null);

      await expect(membershipService.toggleMembershipStatus('non-existent-id')).rejects.toThrow(
        ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND
      );
    });

    it('should handle save errors during toggle', async () => {
      const membershipWithSaveError = { ...mockMembership };
      membershipWithSaveError.save.mockRejectedValue(new Error('Save failed'));

      MockedMembership.findOne.mockImplementation((query: any) => {
        if (query.id === 'test-membership-id') return Promise.resolve(membershipWithSaveError);
        return Promise.resolve(null);
      });

      await expect(membershipService.toggleMembershipStatus('test-membership-id')).rejects.toThrow('Save failed');
    });
  });
});