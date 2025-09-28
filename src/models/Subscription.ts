// En src/models/Subscription.ts

import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';

interface IHistoricMembership {
  membership_id: string; 
  name: string;
  cost: number;
  max_classes_assistance: number;
  max_gym_assistance: number;
  duration_months: number;
  purchase_date: Date; 
}

export interface ISubscription extends Document {
  id: string;
  user_id: Types.ObjectId | IUser;
  memberships: IHistoricMembership[]; // El array que funciona como historial
}

const subscriptionSchema = new Schema<ISubscription>({
  id: {
    type: String,
    required: true,
    unique: true,
  },

  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // Array de membresías compradas
  memberships: [{
    _id: false, 
    
    membership_id: { type: String, required: true },
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    max_classes_assistance: { type: Number, required: true },
    max_gym_assistance: { type: Number, required: true },
    duration_months: { type: Number, required: true },

    purchase_date: { type: Date, required: true },
  }],
});

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);