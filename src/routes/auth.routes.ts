import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, registerSchema, loginSchema } from '../middleware/validation.middleware';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);

router.post('/login', validate(loginSchema), AuthController.login);

router.post('/refresh', AuthController.refreshToken);

router.post('/logout', authenticate, AuthController.logout);

router.get('/profile', authenticate, AuthController.getProfile);

router.put('/profile', authenticate, AuthController.updateProfile);

router.put('/change-password', authenticate, AuthController.changePassword);

export default router;