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

      const mockUser = { id: 'user-id', name: 'Test User' };
      const mockSave = jest.fn().mockResolvedValue({ id: 'attendance-id' });

      MockedUser.findOne.mockResolvedValue(mockUser as any);
      MockedAttendance.findOne.mockResolvedValue(null);
      MockedSubscription.findOne.mockResolvedValue({
        subscriptions: [{ membershipId: 'mem-id', endDate: new Date(Date.now() + 86400000) }]
      } as any);

      // Mock the constructor properly
      (MockedAttendance as any).mockImplementation(() => ({
        save: mockSave
      }));

      const result = await attendanceService.checkIn(checkInData);

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'user-id' });
      expect(result).toBeDefined();
    });
  });

  describe('getUserAttendanceHistory', () => {
    it('should get attendance history for user', async () => {
      const mockAttendances = [
        { id: 'att-1', userId: 'user-id', type: 'gym' },
        { id: 'att-2', userId: 'user-id', type: 'class' }
      ];

      MockedAttendance.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockAttendances)
      } as any);

      const result = await attendanceService.getUserAttendanceHistory({
        userId: 'user-id',
        from: '2023-01-01',
        to: '2023-12-31',
        type: 'gym'
      });

      expect(MockedAttendance.find).toHaveBeenCalled();
      expect(result).toEqual(mockAttendances);
    });
  });
});