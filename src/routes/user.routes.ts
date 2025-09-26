import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, updateUserSchema, assignRoleSchema, createRoleSchema, createPermissionSchema } from '../middleware/validation.middleware';

export const userRouter = Router();
const userController = new UserController();

userRouter.get('/', authenticate, authorize(['admin', 'recepcionista']), userController.getAllUsers);
userRouter.get('/:id', authenticate, authorize(['admin', 'recepcionista']), userController.getUserById);
userRouter.post('/', authenticate, authorize(['admin', 'recepcionista']), userController.createUser);
userRouter.put('/:id', authenticate, authorize(['admin', 'recepcionista']), validate(updateUserSchema), userController.updateUser);
userRouter.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);
userRouter.patch('/:id/toggle-status', authenticate, authorize(['admin']), userController.toggleUserStatus);
userRouter.post('/assign-roles', authenticate, authorize(['admin']), validate(assignRoleSchema), userController.assignRoles);

