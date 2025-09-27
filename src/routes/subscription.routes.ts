import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate, authorize, authorizeRolesOrOwner } from '../middleware/auth.middleware';
import { validate, createSubscriptionSchema, addMembershipToSubscriptionSchema } from '../middleware/validation.middleware';

export const subscriptionRouter = Router();
const subscriptionController = new SubscriptionController();

subscriptionRouter.get(
  '/user/:userId',
  authenticate,
  authorizeRolesOrOwner(['admin', 'recepcionista']), 
  subscriptionController.getSubscriptionByUserId
);

subscriptionRouter.put(
  '/:id/add-membership',
  authenticate,
  authorize(['admin', 'recepcionista']),
  validate(addMembershipToSubscriptionSchema), 
  subscriptionController.addMembership
);

subscriptionRouter.post(
  '/',
  authenticate,
  authorize(['admin']),
  validate(createSubscriptionSchema), 
  subscriptionController.createSubscription
);