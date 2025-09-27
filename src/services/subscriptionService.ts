import { ISubscriptionService } from '../interfaces/ISubscriptionService';
import { CreateSubscriptionInput, AddMembershipInput } from '../dto/SubscriptionDTO';
import { Subscription } from '../models/Subscription';
import { Membership } from '../models/Membership';
import { User } from '../models/User';
import { ERROR_MESSAGES } from '../utils/errorMessages'; // Asumo que tienes un archivo de errores
import { generateSubscriptionId } from '../utils/generateId';

class SubscriptionService implements ISubscriptionService {
  
  async findSubscriptionByUserId(userId: string): Promise<any> {
   
    const subscription = await Subscription.findOne({ user_id: userId })
      .populate('user_id', 'id full_name email'); 

    if (!subscription) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
    }
    return subscription;
  }

  async createSubscriptionForUser(data: CreateSubscriptionInput): Promise<any> {
    const { userId } = data;

    const userExists = await User.findOne({ id: userId });
    if (!userExists) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const existingSubscription = await Subscription.findOne({ user_id: userExists._id });
    if (existingSubscription) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_ALREADY_EXISTS);
    }
    

    const newSubscription = new Subscription({
      id: generateSubscriptionId(),
      user_id: userExists._id, 
      memberships: [], 
    });

    await newSubscription.save();
    return newSubscription;
  }

  async addMembershipToSubscription(subscriptionId: string, data: AddMembershipInput): Promise<any> {
    const { membershipId } = data;

    // info de la membresia
    const membershipTemplate = await Membership.findOne({ id: membershipId });
    if (!membershipTemplate) {
      throw new Error(ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND);
    }

    // crear el historial
    const historicEntry = {
      membership_id: membershipTemplate.id,
      name: membershipTemplate.name,
      cost: membershipTemplate.cost,
      max_classes_assistance: membershipTemplate.max_classes_assistance,
      max_gym_assistance: membershipTemplate.max_gym_assistance,
      duration_months: membershipTemplate.duration_months,
      purchase_date: new Date(), 
    };

    const updatedSubscription = await Subscription.findOneAndUpdate(
      { id: subscriptionId },
      { $push: { memberships: historicEntry } },
      { new: true } // devuelve el documento ya actualizado
    );

    if (!updatedSubscription) {
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
    }

    return updatedSubscription;
  }
}

export const subscriptionService = new SubscriptionService();