import { User } from '../models/User';
import { Role } from '../models/Role';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { generateUserId } from '../utils/generateId';
import { ERROR_MESSAGES } from '../config/constants';
import { IAuthService, IUserRegistration, IAuthTokens, IUserWithRole } from '../interfaces/IAuthService';

class AuthService implements IAuthService {
  static validateEmailNotExists(email: string) {
    throw new Error('Method not implemented.');
  }
  async validateEmailNotExists(email: string): Promise<void> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }
  }

  async createUserWithClientRole(userData: IUserRegistration): Promise<IUserWithRole> {
    const defaultClientRole = await this.findDefaultClientRole();
    const uniqueUserId = generateUserId();

    const newUser = await this.buildAndSaveUser(userData, uniqueUserId, defaultClientRole.id);

    return { user: newUser, role: defaultClientRole };
  }

  async validateUserCredentials(email: string, password: string): Promise<any> {
    const userWithRoles = await this.findUserByEmailWithRoles(email);

    this.validateUserIsActive(userWithRoles);
    await this.validatePassword(userWithRoles, password);
    await this.updateLastLoginTime(userWithRoles);

    return userWithRoles;
  }

  generateAuthTokens(userId: string, email: string, roleNames: string[]): IAuthTokens {
    const accessToken = generateToken({ userId, email, roles: roleNames });
    const refreshToken = generateRefreshToken(userId);
    return { accessToken, refreshToken };
  }

  async getUserWithoutPassword(userId: string): Promise<any> {
    return await User.findById(userId)
      .populate('rol', 'name')
      .select('-password');
  }

  private async findDefaultClientRole() {
    const clientRole = await Role.findOne({ name: 'cliente' });
    if (!clientRole) {
      throw new Error(ERROR_MESSAGES.DEFAULT_ROLE_NOT_FOUND);
    }
    return clientRole;
  }

  private async buildAndSaveUser(userData: IUserRegistration, userId: string, roleId: string) {
    const newUser = new User({
      id: userId,
      email: userData.email,
      password: userData.password,
      fulll_name: userData.fulll_name,
      age: userData.age,
      phone: userData.phone,
      rol: [roleId]
    });

    await newUser.save();
    return newUser;
  }

  private async findUserByEmailWithRoles(email: string) {
    const userFound = await User.findOne({ email }).populate('rol', 'name');
    if (!userFound) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    return userFound;
  }

  private validateUserIsActive(user: any): void {
    if (!user.isActive) {
      throw new Error(ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
    }
  }

  private async validatePassword(user: any, password: string): Promise<void> {
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
  }

  private async updateLastLoginTime(user: any): Promise<void> {
    user.lastLogin = new Date();
    await user.save();
  }

  extractRoleNames(user: any): string[] {
    return user.rol.map((role: any) => role.name);
  }

  removePasswordFromUserObject(user: any) {
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }
}

export const authService = new AuthService;