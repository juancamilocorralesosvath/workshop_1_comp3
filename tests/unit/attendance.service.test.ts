import { attendanceService } from '../../src/services/attendanceService';
import { Attendance } from '../../src/models/Attendance';
import { generateAttendanceId } from '../../src/utils/generateId';

jest.mock('../../src/models/Attendance');
jest.mock('../../src/utils/generateId');

const MockedAttendance = Attendance as jest.Mocked<typeof Attendance>;
const mockedGenerateId = generateAttendanceId as jest.MockedFunction<typeof generateAttendanceId>;

describe('AttendanceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAttendance', () => {
    it('should create attendance successfully', async () => {
      const attendanceData = {
        userId: 'user-id',
        activity_type: 'gym',
        check_in_time: new Date()
      };

      mockedGenerateId.mockReturnValue('attendance-id');
      const mockSave = jest.fn().mockResolvedValue(undefined);
      MockedAttendance.mockImplementation(() => ({ save: mockSave } as any));

      const result = await attendanceService.createAttendance(attendanceData);

      expect(MockedAttendance).toHaveBeenCalledWith({
        id: 'attendance-id',
        ...attendanceData
      });
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('findAttendanceByUserId', () => {
    it('should find attendance records by user id', async () => {
      const mockAttendances = [
        { id: 'att-1', userId: 'user-id', activity_type: 'gym' },
        { id: 'att-2', userId: 'user-id', activity_type: 'class' }
      ];

      MockedAttendance.find.mockResolvedValue(mockAttendances as any);

      const result = await attendanceService.findAttendanceByUserId('user-id');

      expect(MockedAttendance.find).toHaveBeenCalledWith({ userId: 'user-id' });
      expect(result).toEqual(mockAttendances);
    });
  });
});