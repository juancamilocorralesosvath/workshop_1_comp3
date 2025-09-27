import mongoose, { Document, Schema } from 'mongoose';

export interface IMembership extends Document {
  id: string;
  name: string;
  cost: number;
  status: boolean;
  max_classes_assistance: number;
  max_gym_assistance: number;
  duration_months: number;
}

const membershipSchema = new Schema<IMembership>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: Boolean,
    default: true
  },
  max_classes_assistance: {
    type: Number,
    required: true,
    min: 0
  },
  max_gym_assistance: {
    type: Number,
    required: true,
    min: 0
  },
  duration_months: {
    type: Number,
    required: true,
    enum: [1, 12], // mensual y anual
    validate: {
      validator: function(value: number) {
        return value === 1 || value === 12;
      },
      message: 'La duración debe ser 1 mes (mensual) o 12 meses (anual)'
    }
  }
}, {
  timestamps: true
});


export const Membership = mongoose.model<IMembership>('Membership', membershipSchema);
