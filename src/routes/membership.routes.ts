import { Router } from 'express';
import { MembershipController } from '../controllers/membership.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, createMembershipSchema, updateMembershipSchema } from '../middleware/validation.middleware';

export const membershipRouter = Router();
const membershipController = new MembershipController();

membershipRouter.get('/', authenticate, authorize(['admin', 'recepcionista']), membershipController.getAllMemberships);
membershipRouter.get('/:id', authenticate, authorize(['admin', 'recepcionista', 'coach']), membershipController.getMembershipById);
membershipRouter.post('/', authenticate, authorize(['admin']), validate(createMembershipSchema), membershipController.createMembership);
membershipRouter.put('/:id', authenticate, authorize(['admin']), validate(updateMembershipSchema), membershipController.updateMembership);
membershipRouter.delete('/:id', authenticate, authorize(['admin']), membershipController.deleteMembership);
membershipRouter.patch('/:id/toggle-status', authenticate, authorize(['admin']), membershipController.toggleMembershipStatus);
