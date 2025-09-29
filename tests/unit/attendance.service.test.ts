import { attendanceService } from '../../src/services/attendanceService';
import { Attendance } from '../../src/models/Attendance';
import { User } from '../../src/models/User';
import { Subscription } from '../../src/models/Subscription';

jest.mock('../../src/models/Attendance');
jest.mock('../../src/models/User');
jest.mock('../../src/models/Subscription');

const MockedAttendance = Attendance as jest.Mocked<typeof Attendance>;
const MockedUser = User as jest.Mocked<typeof User>;
const MockedSubscription = Subscription as jest.Mocked<typeof Subscription>;

describe('AttendanceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkIn', () => {
    it('should check in user successfully', async () => {
      const checkInData = {
        userId: 'user-id',
        type: 'gym' as const
      };

      const mockUser = { _id: 'mongo-user-id', id: 'user-id', name: 'Test User' };
      const mockAttendance = { id: 'attendance-id', user_id: 'user-id', type: 'gym' };
      const mockSave = jest.fn().mockResolvedValue(mockAttendance);

      // Mock validateUserExists
      MockedUser.findOne.mockResolvedValue(mockUser as any);

      // Mock isUserCurrentlyInside (should return false to allow check-in)
      MockedAttendance.findOne.mockResolvedValue(null);

      // Mock validateUserCanEnter - needs subscription with available memberships
      MockedSubscription.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          memberships: [{
            membership_id: 'mem-id',
            max_gym_assistance: 10,
            duration_months: 1,
            purchase_date: new Date()
          }]
        })
      } as any);

      // Mock Attendance constructor and find
      (MockedAttendance as any).mockImplementation(() => ({
        save: mockSave,
        id: 'attendance-id'
      }));

      MockedAttendance.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]) // No previous attendances today
      } as any);

      const result = await attendanceService.checkIn(checkInData);

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'user-id' });
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('getUserAttendanceHistory', () => {
    it('should get attendance history for user', async () => {
      const mockUser = { id: 'user-id', name: 'Test User' };
      const mockAttendances = [
        { id: 'att-1', user_id: 'user-id', type: 'gym' },
        { id: 'att-2', user_id: 'user-id', type: 'class' }
      ];

      // Mock validateUserExists
      MockedUser.findOne.mockResolvedValue(mockUser as any);

      MockedAttendance.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockAttendances)
      } as any);

      const result = await attendanceService.getUserAttendanceHistory({
        userId: 'user-id',
        from: '2023-01-01',
        to: '2023-12-31',
        type: 'gym'
      });

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'user-id' });
      expect(MockedAttendance.find).toHaveBeenCalled();
      expect(result).toEqual(mockAttendances);
    });
  });
});