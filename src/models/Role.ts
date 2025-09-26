import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRole extends Document {
  id: string;
  name: string;
  permissions: Types.ObjectId[];
}

const roleSchema = new Schema<IRole>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  }]
}, {
  timestamps: true
});

export const Role = mongoose.model<IRole>('Role', roleSchema);