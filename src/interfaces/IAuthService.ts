import { Document } from 'mongoose';
import { User } from '../models/User';
import { Role } from '../models/Role';

export interface IUserRegistration {
  email: string;
  password: string;
  full_name: string;
  age: number;
  phone: string;
}

export interface IUserCredentials {
  email: string;
  password: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IUserWithRole {
  user: InstanceType<typeof User> & Document;
  role: InstanceType<typeof Role> & Document;
}

export interface IAuthService {
  validateEmailNotExists(email: string): Promise<void>;
  createUserWithClientRole(userData: IUserRegistration): Promise<IUserWithRole>;
  validateUserCredentials(email: string, password: string): Promise<InstanceType<typeof User> & Document>;
  generateAuthTokens(userId: string, email: string, roles: string[]): IAuthTokens;
  getUserWithoutPassword(userId: string): Promise<Omit<InstanceType<typeof User> & Document, 'password'>>;
  extractRoleNames(user: InstanceType<typeof User> & Document): string[];
  removePasswordFromUserObject(user: InstanceType<typeof User> & Document): Omit<any, 'password'>;
}