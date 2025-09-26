import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  id: string;
  name: string;
}

const permissionSchema = new Schema<IPermission>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);