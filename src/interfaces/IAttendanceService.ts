import { CheckInInput, CheckOutInput, AttendanceHistoryInput, AttendanceStatus, AttendanceStatsResponse } from '../dto/AttendanceDTO';

export interface IAttendanceService {

  checkIn(data: CheckInInput): Promise<any>;
  checkOut(data: CheckOutInput): Promise<any>;
  
  getUserAttendanceStatus(userId: string): Promise<AttendanceStatus>;
  getUserAttendanceHistory(data: AttendanceHistoryInput): Promise<any[]>;
  getActiveAttendances(): Promise<any[]>;
  getUserAttendanceStats(userId: string): Promise<AttendanceStatsResponse>;
  
  validateUserCanEnter(userId: string, type: 'gym' | 'class'): Promise<boolean>;
  hasAvailableAttendances(userId: string, type: 'gym' | 'class'): Promise<number>;
  isUserCurrentlyInside(userId: string): Promise<boolean>;
}
