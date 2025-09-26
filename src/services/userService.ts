import { User } from '../models/User';
import { Role } from '../models/Role';
import { generateUserId } from '../utils/generateId';
import { ERROR_MESSAGES } from '../config/constants';
import { PAGINATION_CONFIG } from '../config/constants';
import {
  IUserService,
  IUserFilters,
  ICreateUserData,
  IUpdateUserData,
  IPaginatedUsers
} from '../interfaces/IUserService';

export class UserService implements IUserService {
  async getAllUsersWithFilters(filters: IUserFilters): Promise<IPaginatedUsers> {
    const queryConditions = this.buildQueryConditions(filters);
    const paginationOptions = this.buildPaginationOptions(filters);

    const users = await User.find(queryConditions)
      .populate('rol', 'name')
      .select('-password')
      .limit(paginationOptions.limit)
      .skip(paginationOptions.skip)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(queryConditions);

    return {
      users,
      pagination: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / paginationOptions.limit)
      }
    };
  }

  async findUserById(userId: string): Promise<any> {
    const user = await User.findOne({ id: userId })
      .populate('rol', 'name')
      .select('-password');

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  async createNewUser(userData: ICreateUserData): Promise<any> {
    await this.validateEmailIsUnique(userData.email);

    const assignedRoles = await this.getAssignedRoles(userData.roleIds);
    const uniqueUserId = generateUserId();

    const newUser = await this.buildAndSaveUser(userData, uniqueUserId, assignedRoles);

    return await this.getUserWithRolesById(newUser._id);
  }

  async updateExistingUser(userId: string, updateData: IUpdateUserData): Promise<any> {
    const existingUser = await this.findUserEntityById(userId);

    if (updateData.email && updateData.email !== existingUser.email) {
      await this.validateEmailIsUnique(updateData.email);
    }

    this.applyUpdatesToUser(existingUser, updateData);
    await existingUser.save();

    return await this.getUserWithRolesById(existingUser._id);
  }

  async removeUser(userId: string): Promise<void> {
    const userToDelete = await this.findUserEntityById(userId);
    await User.findByIdAndDelete(userToDelete._id);
  }

  async assignRolesToUser(userId: string, roleIds: string[]): Promise<any> {
    const userToUpdate = await this.findUserEntityById(userId);
    await this.validateRolesExist(roleIds);

    userToUpdate.rol = roleIds;
    await userToUpdate.save();

    return await this.getUserWithRolesById(userToUpdate._id);
  }

  async toggleUserActiveStatus(userId: string): Promise<any> {
    const userToToggle = await this.findUserEntityById(userId);

    userToToggle.isActive = !userToToggle.isActive;
    await userToToggle.save();

    return await this.getUserWithRolesById(userToToggle._id);
  }

  private buildQueryConditions(filters: IUserFilters) {
    const queryConditions: any = {};

    if (filters.search) {
      queryConditions.$or = [
        { fulll_name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.isActive !== undefined) {
      queryConditions.isActive = filters.isActive;
    }

    return queryConditions;
  }

  private buildPaginationOptions(filters: IUserFilters) {
    const page = filters.page || PAGINATION_CONFIG.DEFAULT_PAGE;
    const limit = Math.min(filters.limit || PAGINATION_CONFIG.DEFAULT_LIMIT, PAGINATION_CONFIG.MAX_LIMIT);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
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

    await this.validateRolesExist(roleIds);
    return roleIds;
  }

  private async getDefaultClientRole() {
    const clientRole = await Role.findOne({ name: 'cliente' });
    if (!clientRole) {
      throw new Error(ERROR_MESSAGES.DEFAULT_ROLE_NOT_FOUND);
    }
    return [clientRole._id];
  }

  private async validateRolesExist(roleIds: string[]): Promise<void> {
    const foundRoles = await Role.find({ _id: { $in: roleIds } });
    if (foundRoles.length !== roleIds.length) {
      throw new Error(ERROR_MESSAGES.ROLE_NOT_FOUND);
    }
  }

  private async buildAndSaveUser(userData: ICreateUserData, userId: string, roleIds: any[]) {
    const newUser = new User({
      id: userId,
      email: userData.email,
      password: userData.password,
      fulll_name: userData.fulll_name,
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

  private async getUserWithRolesById(objectId: string) {
    return await User.findById(objectId)
      .populate('rol', 'name')
      .select('-password');
  }

  private applyUpdatesToUser(user: any, updateData: IUpdateUserData): void {
    if (updateData.email) user.email = updateData.email;
    if (updateData.fulll_name) user.fulll_name = updateData.fulll_name;
    if (updateData.age) user.age = updateData.age;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
  }
}