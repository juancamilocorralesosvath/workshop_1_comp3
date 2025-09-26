import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, registerSchema, loginSchema } from '../middleware/validation.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.registerNewUser);

router.post('/login', validate(loginSchema), authController.authenticateUser);

router.post('/refresh', authController.refreshToken);

router.post('/logout', authenticate, authController.logout);

router.get('/profile', authenticate, authController.getProfile);

router.put('/profile', authenticate, authController.updateProfile);

router.put('/change-password', authenticate, authController.changePassword);

export default router;