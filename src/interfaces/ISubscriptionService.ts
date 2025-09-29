import { CreateSubscriptionInput, AddMembershipInput } from '../dto/SubscriptionDTO';

export interface ISubscriptionService {
 
  findSubscriptionByUserId(userId: string): Promise<any>;

  createSubscriptionForUser(data: CreateSubscriptionInput): Promise<any>;

  addMembershipToSubscription(subscriptionId: string, data: AddMembershipInput): Promise<any>;
}