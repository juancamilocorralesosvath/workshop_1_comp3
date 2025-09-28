import { Attendance } from '../models/Attendance';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { generateAttendanceId } from '../utils/generateId';
import { ERROR_MESSAGES } from '../utils/errorMessages';

import { IAttendanceService } from '../interfaces/IAttendanceService';
import { CheckInInput, CheckOutInput, AttendanceHistoryInput, AttendanceStatus, AttendanceStatsResponse } from '../dto/AttendanceDTO';

class AttendanceService implements IAttendanceService {

  async checkIn(data: CheckInInput): Promise<any> {
    const { userId, type } = data;

    await this.validateUserExists(userId);

    const isInside = await this.isUserCurrentlyInside(userId);
    if (isInside) {
      throw new Error(ERROR_MESSAGES.ATTENDANCE_ALREADY_INSIDE);
    }

    const canEnter = await this.validateUserCanEnter(userId, type);
    if (!canEnter) {
      throw new Error(ERROR_MESSAGES.ATTENDANCE_NO_AVAILABLE);
    }

    const uniqueAttendanceId = generateAttendanceId();
    const currentDate = new Date();
    const dateKey = this.generateDateKey(currentDate);

    const newAttendance = await this.buildAndSaveAttendance({
      id: uniqueAttendanceId,
      user_id: userId,
      entrance_dateTime: currentDate,
      type,
      date_key: dateKey,
      is_active: true
    });

    return await this.getAttendanceById(newAttendance.id);
  }

  async checkOut(data: CheckOutInput): Promise<any> {
    const { userId } = data;

    await this.validateUserExists(userId);

    const activeAttendance = await this.findActiveAttendanceByUserId(userId);
    if (!activeAttendance) {
      throw new Error(ERROR_MESSAGES.ATTENDANCE_NOT_INSIDE);
    }

    activeAttendance.exit_dateTime = new Date();
    activeAttendance.is_active = false;
    await activeAttendance.save();

    return await this.getAttendanceById(activeAttendance.id);
  }

  async getUserAttendanceStatus(userId: string): Promise<AttendanceStatus> {
    const currentAttendance = await this.findActiveAttendanceByUserId(userId);
    const isInside = !!currentAttendance;

    const availableAttendances = await this.calculateAvailableAttendances(userId);

    return {
      isInside,
      currentAttendance: isInside ? {
        id: currentAttendance!.id,
        entrance_dateTime: currentAttendance!.entrance_dateTime,
        type: currentAttendance!.type
      } : undefined,
      availableAttendances
    };
  }

  async getUserAttendanceHistory(data: AttendanceHistoryInput): Promise<any[]> {
    const { userId, from, to, type } = data;

    await this.validateUserExists(userId);

    const query: any = { user_id: userId };

    if (type) {
      query.type = type;
    }

    if (from || to) {
      query.entrance_dateTime = {};
      if (from) {
        query.entrance_dateTime.$gte = new Date(from);
      }
      if (to) {
        query.entrance_dateTime.$lte = new Date(to + 'T23:59:59.999Z');
      }
    }

    const attendances = await Attendance.find(query)
      .sort({ entrance_dateTime: -1 });

    return attendances;
  }

  async getActiveAttendances(): Promise<any[]> {
    const activeAttendances = await Attendance.find({ is_active: true })
      .populate('user_id', 'id full_name email')
      .sort({ entrance_dateTime: -1 });

    return activeAttendances;
  }

  async getUserAttendanceStats(userId: string): Promise<AttendanceStatsResponse> {
    await this.validateUserExists(userId);

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const yearlyAttendances = await Attendance.find({
      user_id: userId,
      entrance_dateTime: { $gte: startOfYear }
    });

    const totalGymAttendances = yearlyAttendances.filter(a => a.type === 'gym').length;
    const totalClassAttendances = yearlyAttendances.filter(a => a.type === 'class').length;

    // estadísticas mensuales
    const monthlyStats = this.calculateMonthlyStats(yearlyAttendances);

    return {
      totalGymAttendances,
      totalClassAttendances,
      monthlyStats
    };
  }

  async validateUserCanEnter(userId: string, type: 'gym' | 'class'): Promise<boolean> {
    const availableCount = await this.hasAvailableAttendances(userId, type);
    return availableCount > 0;
  }

  async hasAvailableAttendances(userId: string, type: 'gym' | 'class'): Promise<number> {
    try {
      const availableAttendances = await this.calculateAvailableAttendances(userId);
      return type === 'gym' ? availableAttendances.gym : availableAttendances.classes;
    } catch (error) {
      return 0;
    }
  }

  async isUserCurrentlyInside(userId: string): Promise<boolean> {
    const activeAttendance = await this.findActiveAttendanceByUserId(userId);
    return !!activeAttendance;
  }

  private async validateUserExists(userId: string): Promise<void> {
    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }
  }

  private async findActiveAttendanceByUserId(userId: string) {
    return await Attendance.findOne({ user_id: userId, is_active: true });
  }

  private async buildAndSaveAttendance(attendanceData: any) {
    const newAttendance = new Attendance(attendanceData);
    await newAttendance.save();
    return newAttendance;
  }

  private async getAttendanceById(attendanceId: string) {
    return await Attendance.findOne({ id: attendanceId });
  }

  private generateDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private async calculateAvailableAttendances(userId: string) {
    try {
      const subscription = await Subscription.findOne({ user_id: userId });
      if (!subscription || !subscription.memberships || subscription.memberships.length === 0) {
        return { gym: 0, classes: 0 };
      }

      let totalGym = 0;
      let totalClasses = 0;

      subscription.memberships.forEach((membership: any) => {
        totalGym += membership.max_gym_assistance || 0;
        totalClasses += membership.max_classes_assistance || 0;
      });

      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const usedAttendances = await Attendance.find({
        user_id: userId,
        entrance_dateTime: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });

      const usedGym = usedAttendances.filter(a => a.type === 'gym').length;
      const usedClasses = usedAttendances.filter(a => a.type === 'class').length;

      return {
        gym: Math.max(0, totalGym - usedGym),
        classes: Math.max(0, totalClasses - usedClasses)
      };
    } catch (error) {
      return { gym: 0, classes: 0 };
    }
  }

  private calculateMonthlyStats(attendances: any[]) {
    const monthlyMap = new Map();

    attendances.forEach(attendance => {
      const date = new Date(attendance.entrance_dateTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, gymCount: 0, classCount: 0 });
      }

      const monthData = monthlyMap.get(monthKey);
      if (attendance.type === 'gym') {
        monthData.gymCount++;
      } else {
        monthData.classCount++;
      }
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }
}

export const attendanceService = new AttendanceService();
