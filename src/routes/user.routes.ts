import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, updateUserSchema, assignRoleSchema, createRoleSchema, createPermissionSchema } from '../middleware/validation.middleware';

const router = Router();

// User management routes (admin and reception only)
router.get('/', authenticate, authorize(['admin', 'recepcionista']), UserController.getAllUsers);
router.get('/:id', authenticate, authorize(['admin', 'recepcionista']), UserController.getUserById);
router.post('/', authenticate, authorize(['admin', 'recepcionista']), UserController.createUser);
router.put('/:id', authenticate, authorize(['admin', 'recepcionista']), validate(updateUserSchema), UserController.updateUser);
router.delete('/:id', authenticate, authorize(['admin']), UserController.deleteUser);
router.patch('/:id/toggle-status', authenticate, authorize(['admin']), UserController.toggleUserStatus);
router.post('/assign-roles', authenticate, authorize(['admin']), validate(assignRoleSchema), UserController.assignRoles);

// Role management routes (admin only)
router.get('/roles/all', authenticate, authorize(['admin']), UserController.getAllRoles);
router.post('/roles', authenticate, authorize(['admin']), validate(createRoleSchema), UserController.createRole);
router.put('/roles/:id', authenticate, authorize(['admin']), UserController.updateRole);
router.delete('/roles/:id', authenticate, authorize(['admin']), UserController.deleteRole);

// Permission management routes (admin only)
router.get('/permissions/all', authenticate, authorize(['admin']), UserController.getAllPermissions);
router.post('/permissions', authenticate, authorize(['admin']), validate(createPermissionSchema), UserController.createPermission);
router.delete('/permissions/:id', authenticate, authorize(['admin']), UserController.deletePermission);

export default router;