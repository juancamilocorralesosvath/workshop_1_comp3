import { attendanceService } from '../../src/services/attendanceService';
import { Attendance } from '../../src/models/Attendance';
import { User } from '../../src/models/User';

jest.mock('../../src/models/Attendance');
jest.mock('../../src/models/User');

const MockedAttendance = Attendance as jest.Mocked<typeof Attendance>;
const MockedUser = User as jest.Mocked<typeof User>;

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
      const mockSave = jest.fn().mockResolvedValue(undefined);

      MockedUser.findOne.mockResolvedValue(mockUser as any);
      MockedAttendance.findOne.mockResolvedValue(null);
      MockedAttendance.mockImplementation(() => ({ save: mockSave } as any));

      await attendanceService.checkIn(checkInData);

      expect(MockedUser.findOne).toHaveBeenCalledWith({ id: 'user-id' });
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('getAttendanceHistory', () => {
    it('should get attendance history for user', async () => {
      const mockAttendances = [
        { id: 'att-1', userId: 'user-id', type: 'gym' },
        { id: 'att-2', userId: 'user-id', type: 'class' }
      ];

      MockedAttendance.find.mockResolvedValue(mockAttendances as any);

      const result = await attendanceService.getAttendanceHistory({
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