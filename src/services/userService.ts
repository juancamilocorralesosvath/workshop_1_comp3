import { User } from '../models/User';
import { Role } from '../models/Role';
import { generateUserId } from '../utils/generateId';
import { ERROR_MESSAGES } from '../utils/errorMessages';

import {
  IUserService,
  ICreateUserData,
  IUpdateUserData,
} from '../interfaces/IUserService';
import { subscriptionService } from './subscriptionService';

class UserService implements IUserService {
 
  async findUserById(userId: string): Promise<any> {
    const user = await User.findOne({ id: userId })
      .populate('rol', 'name')
      .select('-password');

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  async findAll(): Promise<any> {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      throw error;
    }
  }

  async createNewUser(userData: ICreateUserData): Promise<any> {
    console.log('Creating user with data:', { email: userData.email, roleIds: userData.roleIds });

    await this.validateEmailIsUnique(userData.email);

    const assignedRoles = await this.getAssignedRoles(userData.roleIds);
    console.log('Assigned roles:', assignedRoles);

    const uniqueUserId = generateUserId();
    console.log('Generated user ID:', uniqueUserId);

    const newUser = await this.buildAndSaveUser(userData, uniqueUserId, assignedRoles);
    console.log('User saved with _id:', newUser._id);

    try {
      await subscriptionService.createSubscriptionForUser({ userId: uniqueUserId });
      console.log('Subscription history created successfully.');
    } catch (error) {
      console.log("UserService createNewUser error:", error)
      console.error(`FAILED to create subscription for user ${uniqueUserId}. Rolling back user creation.`);
      await User.findByIdAndDelete(newUser._id.toString());
      throw error;
    }

    return await this.getUserWithRolesById(newUser._id.toString());
  }

  async updateExistingUser(userId: string, updateData: IUpdateUserData): Promise<any> {
    const existingUser = await this.findUserEntityById(userId);

    if (updateData.email && updateData.email !== existingUser.email) {
      await this.validateEmailIsUnique(updateData.email);
    }

    this.applyUpdatesToUser(existingUser, updateData);
    await existingUser.save();

    return await this.getUserWithRolesById(existingUser._id.toString());
  }

  async removeUser(userId: string): Promise<void> {
    const userToDelete = await this.findUserEntityById(userId);
    await User.findByIdAndDelete(userToDelete._id.toString());
  }

  async assignRolesToUser(userId: string, roleIds: string[]): Promise<any> {
    const userToUpdate = await this.findUserEntityById(userId);
    const validatedRoleObjectIds = await this.validateRolesExist(roleIds);

    userToUpdate.rol = validatedRoleObjectIds;
    await userToUpdate.save();

    return await this.getUserWithRolesById(userToUpdate._id.toString());
  }

  async toggleUserActiveStatus(userId: string): Promise<any> {
    const userToToggle = await this.findUserEntityById(userId);

    userToToggle.isActive = !userToToggle.isActive;
    await userToToggle.save();

    return await this.getUserWithRolesById(userToToggle._id.toString());
  }

  private async validateEmailIsUnique(email: string): Promise<void> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }
  }

  private async getAssignedRoles(roleIds?: string[]) {
    if (!roleIds || roleIds.length === 0) {
      return await this.getDefaultClientRole();
    }

    return await this.validateRolesExist(roleIds);
  }

  private async getDefaultClientRole() {
    const clientRole = await Role.findOne({ name: 'cliente' });
    if (!clientRole) {
      throw new Error(ERROR_MESSAGES.DEFAULT_ROLE_NOT_FOUND);
    }
    return [clientRole._id];
  }

  private async validateRolesExist(roleIds: string[]): Promise<any[]> {
    const foundRoles = await Role.find({ _id: { $in: roleIds } });
    if (foundRoles.length !== roleIds.length) {
      throw new Error(ERROR_MESSAGES.ROLE_NOT_FOUND);
    }
    return foundRoles.map(role => role._id);
  }

  private async buildAndSaveUser(userData: ICreateUserData, userId: string, roleIds: any[]) {
    const newUser = new User({
      id: userId,
      email: userData.email,
      password: userData.password,
      full_name: userData.full_name,
      age: userData.age,
      phone: userData.phone,
      rol: roleIds
    });

    await newUser.save();
    return newUser;
  }

  private async findUserEntityById(userId: string) {
    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  private async getUserWithRolesById(objectId: any) {
    console.log('Looking for user with _id:', objectId);
    const user = await User.findById(String(objectId))
      .populate('rol', 'name')
      .select('-password');
    console.log('Found user:', user ? 'YES' : 'NO');
    return user;
  }

  private applyUpdatesToUser(user: any, updateData: IUpdateUserData): void {
    if (updateData.email) user.email = updateData.email;
    if (updateData.full_name) user.full_name = updateData.full_name;
    if (updateData.age) user.age = updateData.age;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
  }
}

export const userService = new UserService();