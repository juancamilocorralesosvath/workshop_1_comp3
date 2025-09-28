import { Request, Response } from 'express';
import { attendanceService } from '../services/attendanceService';
import { CheckInInput, CheckOutInput, AttendanceHistoryInput } from '../dto/AttendanceDTO';
import { ERROR_MESSAGES } from '../utils/errorMessages';

export class AttendanceController {

  checkIn = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { type } = req.body;
      if (!userId) return res.status(400).json({ message: 'User ID is required' });
      
      const checkInData: CheckInInput = { userId, type };
      const attendance = await attendanceService.checkIn(checkInData);
      return res.status(201).json(attendance);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      if (err.message === ERROR_MESSAGES.ATTENDANCE_ALREADY_INSIDE) {
        return res.status(409).json({ message: err.message });
      }
      if (err.message === ERROR_MESSAGES.ATTENDANCE_NO_AVAILABLE) {
        return res.status(403).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error processing check-in', error: err.message });
    }
  };

  checkOut = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ message: 'User ID is required' });
      
      const checkOutData: CheckOutInput = { userId };
      const attendance = await attendanceService.checkOut(checkOutData);
      return res.status(200).json(attendance);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      if (err.message === ERROR_MESSAGES.ATTENDANCE_NOT_INSIDE) {
        return res.status(409).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error processing check-out', error: err.message });
    }
  };

  getStatus = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ message: 'User ID is required' });
      
      const status = await attendanceService.getUserAttendanceStatus(userId);
      return res.status(200).json(status);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error retrieving attendance status', error: err.message });
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ message: 'User ID is required' });

      const { from, to, type } = req.query;
      
      const historyData: AttendanceHistoryInput = {
        userId,
        from: from as string,
        to: to as string,
        type: type as 'gym' | 'class'
      };

      const history = await attendanceService.getUserAttendanceHistory(historyData);
      return res.status(200).json(history);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      if (err.message === ERROR_MESSAGES.ATTENDANCE_INVALID_DATE_RANGE) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error retrieving attendance history', error: err.message });
    }
  };

  getAllActive = async (req: Request, res: Response) => {
    try {
      const activeAttendances = await attendanceService.getActiveAttendances();
      return res.status(200).json(activeAttendances);
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'Error retrieving active attendances', error: err.message });
    }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ message: 'User ID is required' });

      const stats = await attendanceService.getUserAttendanceStats(userId);
      return res.status(200).json(stats);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error retrieving attendance stats', error: err.message });
    }
  };
}
