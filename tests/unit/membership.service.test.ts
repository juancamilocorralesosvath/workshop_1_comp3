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

      mockedGenerateId.mockReturnValue('generated-id');
      MockedMembership.findOne.mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue(undefined);
      MockedMembership.mockImplementation(() => ({ save: mockSave } as any));

      await membershipService.createNewMembership(membershipData);

      expect(MockedMembership.findOne).toHaveBeenCalledWith({ name: membershipData.name });
      expect(MockedMembership).toHaveBeenCalledWith({
        id: 'generated-id',
        ...membershipData,
        status: true
      });
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

      MockedMembership.findOne.mockImplementation((query: any) => {
        if (query.id) return Promise.resolve(mockMembership);
        if (query.name) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      const result = await membershipService.updateExistingMembership('membership-id', updateData);

      expect(mockMembership.name).toBe('New Name');
      expect(mockMembership.cost).toBe(75000);
      expect(mockMembership.save).toHaveBeenCalled();
    });
  });
});