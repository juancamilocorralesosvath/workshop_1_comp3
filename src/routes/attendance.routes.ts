import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate, authorize, authorizeRolesOrOwner } from '../middleware/auth.middleware';
import { validate, validateQuery, checkInSchema, attendanceHistoryQuerySchema } from '../middleware/validation.middleware';

export const attendanceRouter = Router();
const attendanceController = new AttendanceController();

attendanceRouter.post('/checkin/:userId', authenticate, authorize(['admin', 'recepcionista']), validate(checkInSchema), attendanceController.checkIn);
attendanceRouter.post('/checkout/:userId', authenticate, authorize(['admin', 'recepcionista']), attendanceController.checkOut);
attendanceRouter.get('/status/:userId', authenticate, authorizeRolesOrOwner(['admin', 'recepcionista', 'coach']), attendanceController.getStatus);
attendanceRouter.get('/history/:userId', authenticate, authorizeRolesOrOwner(['admin', 'recepcionista']), validateQuery(attendanceHistoryQuerySchema), attendanceController.getHistory);
attendanceRouter.get('/active', authenticate, authorize(['admin', 'recepcionista', 'coach']), attendanceController.getAllActive);
attendanceRouter.get('/stats/:userId', authenticate, authorizeRolesOrOwner(['admin', 'recepcionista']), attendanceController.getStats);
