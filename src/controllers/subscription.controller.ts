import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscriptionService';
import { ERROR_MESSAGES } from '../utils/errorMessages';

export class SubscriptionController {


  getSubscriptionByUserId = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: 'El ID del usuario es requerido.' });
      }

      const subscription = await subscriptionService.findSubscriptionByUserId(userId);
      return res.status(200).json(subscription);

    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al obtener la suscripción.', error: err.message });
    }
  };


  createSubscription = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: 'El ID del usuario es requerido.' });
      }

      const newSubscription = await subscriptionService.createSubscriptionForUser({ userId });
      return res.status(201).json(newSubscription);

    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      if (err.message === ERROR_MESSAGES.SUBSCRIPTION_ALREADY_EXISTS) {
        return res.status(409).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al crear la suscripción.', error: err.message });
    }
  };

  addMembership = async (req: Request, res: Response) => {
    try {
      const { id: subscriptionId } = req.params;
      const { membershipId } = req.body;

      if (!subscriptionId) {
        return res.status(400).json({ message: 'El ID de la suscripción es requerido.' });
      }
      if (!membershipId) {
        return res.status(400).json({ message: 'El ID de la membresía es requerido.' });
      }

      const updatedSubscription = await subscriptionService.addMembershipToSubscription(subscriptionId, { membershipId });
      return res.status(200).json(updatedSubscription);

    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND || err.message === ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error al añadir la membresía a la suscripción.', error: err.message });
    }
  };
}

export const subscriptionController = new SubscriptionController();