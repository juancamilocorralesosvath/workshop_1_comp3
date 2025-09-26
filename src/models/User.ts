import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  id: string;
  email: string;
  password: string;
  full_name: string;
  age: string;
  phone: string;
  rol: Types.ObjectId[];
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  rol: [{
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

//Creamos indices para mejorar el rendimiento de las consultas
// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

//Creamos indices para mejorar el rendimiento de las consultas
userSchema.index({ email: 1 });
userSchema.index({ id: 1 });

export const User = mongoose.model<IUser>('User', userSchema);