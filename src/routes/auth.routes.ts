import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, registerSchema, loginSchema } from '../middleware/validation.middleware';

export const authRouter = Router();
const authController = new AuthController();

authRouter.post('/register', validate(registerSchema), authController.registerNewUser);
authRouter.post('/login', validate(loginSchema), authController.authenticateUser);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.get('/profile', authenticate, authController.getProfile);
authRouter.put('/profile', authenticate, authController.updateProfile);
authRouter.put('/change-password', authenticate, authController.changePassword);