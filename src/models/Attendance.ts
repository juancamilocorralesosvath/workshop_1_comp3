import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  id: string;
  // revisar si cambiar por IUser
  user_id: string;
  entrance_dateTime: Date;
  exit_dateTime?: Date;
  type: 'gym' | 'class';
  date_key: string;
  is_active: boolean;
}

const attendanceSchema = new Schema<IAttendance>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  entrance_dateTime: {
    type: Date,
    required: true
  },
  exit_dateTime: {
    type: Date,
    required: false
  },
  type: {
    type: String,
    required: true,
    enum: ['gym', 'class'],
    default: 'gym'
  },
  date_key: {
    type: String,
    required: true
  },
  is_active: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

// índices para optimizar consultas
attendanceSchema.index({ user_id: 1 });
attendanceSchema.index({ date_key: 1 });
attendanceSchema.index({ is_active: 1 });
attendanceSchema.index({ type: 1 });
attendanceSchema.index({ entrance_dateTime: 1 });

// para validaciones de negocio
attendanceSchema.index({ user_id: 1, is_active: 1 });
attendanceSchema.index({ user_id: 1, date_key: 1, type: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
