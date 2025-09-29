import { membershipService } from '../../src/services/membershipService';
import { Membership } from '../../src/models/Membership';
import { generateMembershipId } from '../../src/utils/generateId';

jest.mock('../../src/models/Membership');
jest.mock('../../src/utils/generateId');

const MockedMembership = Membership as jest.Mocked<typeof Membership>;
const mockedGenerateId = generateMembershipId as jest.MockedFunction<typeof generateMembershipId>;

describe('MembershipService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findMembershipById', () => {
    it('should find membership successfully', async () => {
      const mockMembership = { id: 'membership-id', name: 'Basic Plan' };
      MockedMembership.findOne.mockResolvedValue(mockMembership as any);

      const result = await membershipService.findMembershipById('membership-id');

      expect(result).toEqual(mockMembership);
    });

    it('should throw error when membership not found', async () => {
      MockedMembership.findOne.mockResolvedValue(null);

      await expect(membershipService.findMembershipById('non-existent')).rejects.toThrow();
    });
  });

  describe('createNewMembership', () => {
    it('should create membership successfully', async () => {
      const membershipData = {
        name: 'Premium Plan',
        cost: 100000,
        max_classes_assistance: 20,
        max_gym_assistance: 30,
        duration_months: 3
      };

      const mockMembership = { id: 'generated-id', ...membershipData, status: true };

      mockedGenerateId.mockReturnValue('generated-id');
      MockedMembership.findOne
        .mockResolvedValueOnce(null) // For validateNameIsUnique
        .mockResolvedValueOnce(mockMembership); // For getMembershipById

      const mockSave = jest.fn().mockResolvedValue(mockMembership);
      (MockedMembership as any).mockImplementation(() => ({ save: mockSave, id: 'generated-id' }));

      const result = await membershipService.createNewMembership(membershipData);

      expect(MockedMembership.findOne).toHaveBeenCalledWith({ name: membershipData.name });
      expect(MockedMembership).toHaveBeenCalledWith({
        id: 'generated-id',
        name: membershipData.name,
        cost: membershipData.cost,
        status: true,
        max_classes_assistance: membershipData.max_classes_assistance,
        max_gym_assistance: membershipData.max_gym_assistance,
        duration_months: membershipData.duration_months
      });
      expect(result).toEqual(mockMembership);
    });
  });

  describe('updateExistingMembership', () => {
    it('should update membership successfully', async () => {
      const mockMembership = {
        id: 'membership-id',
        name: 'Old Name',
        cost: 50000,
        save: jest.fn().mockResolvedValue(undefined)
      };
      const updateData = { name: 'New Name', cost: 75000 };
      const updatedMembership = { ...mockMembership, ...updateData };

      MockedMembership.findOne.mockImplementation((query: any) => {
        if (query.id === 'membership-id') return Promise.resolve(mockMembership) as any;
        if (query.name === 'New Name') return Promise.resolve(null) as any; // For validateNameIsUnique
        if (query.id === 'membership-id' && !query.name) return Promise.resolve(updatedMembership) as any; // For getMembershipById
        return Promise.resolve(null) as any;
      });

      const result = await membershipService.updateExistingMembership('membership-id', updateData);

      expect(mockMembership.name).toBe('New Name');
      expect(mockMembership.cost).toBe(75000);
      expect(mockMembership.save).toHaveBeenCalled();
      expect(result).toEqual(updatedMembership);
    });
  });
});