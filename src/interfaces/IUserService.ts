import { Document } from 'mongoose';
import { User } from '../models/User';


export interface IUserFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ICreateUserData {
  email: string;
  password: string;
  full_name: string;
  age: number;
  phone: string;
  roleIds?: string[];
}

export interface IUpdateUserData {
  email?: string;
  full_name?: string;
  age?: number;
  phone?: string;
  isActive?: boolean;
}


export interface IUserResponse {
  id: string;
  email: string;
  full_name: string;
  age: number;
  phone: string;
  isActive: boolean;
  rol: any;
  createdAt: Date;
  updatedAt: Date;
}


export interface IUserService {
  findUserById(userId: string): Promise<InstanceType<typeof User> & Document>;
  createNewUser(userData: ICreateUserData): Promise<InstanceType<typeof User> & Document>;
  updateExistingUser(userId: string, updateData: IUpdateUserData): Promise<InstanceType<typeof User> & Document>;
  removeUser(userId: string): Promise<void>;
  assignRolesToUser(userId: string, roleIds: string[]): Promise<InstanceType<typeof User> & Document>;
  toggleUserActiveStatus(userId: string): Promise<InstanceType<typeof User> & Document>;
  findAll(): Promise<Array<InstanceType<typeof User> & Document>>;
}