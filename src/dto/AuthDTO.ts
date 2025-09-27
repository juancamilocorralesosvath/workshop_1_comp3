
import { User } from '../models/User';

export interface UserRegistrationData {
  email: string;
  password: string;
  full_name: string;
  age: number;
  phone: string;
  roleIds?: string[];
}

export interface UserCredentialsData {
  email: string;
  password: string;
}

export interface UserProfileUpdateData {
  full_name?: string;
  age?: number;
  phone?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}


export interface AuthResponse {
  user: InstanceType<typeof User>;
  accessToken: string;
  refreshToken: string;
}