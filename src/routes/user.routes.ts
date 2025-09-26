import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, updateUserSchema, assignRoleSchema, createRoleSchema, createPermissionSchema } from '../middleware/validation.middleware';

const router = Router();
const userController = new UserController();

router.get('/', authenticate, authorize(['admin', 'recepcionista']), userController.getAllUsers);
router.get('/:id', authenticate, authorize(['admin', 'recepcionista']), userController.getUserById);
router.post('/', authenticate, authorize(['admin', 'recepcionista']), userController.createUser);
router.put('/:id', authenticate, authorize(['admin', 'recepcionista']), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);
router.patch('/:id/toggle-status', authenticate, authorize(['admin']), userController.toggleUserStatus);
router.post('/assign-roles', authenticate, authorize(['admin']), validate(assignRoleSchema), userController.assignRoles);

export default router;