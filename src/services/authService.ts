import { User } from '../models/User';
import { Role } from '../models/Role';
import { generateToken, generateRefreshToken } from './jwtService';
import { generateUserId, generateRoleId } from '../utils/generateId';
import { ERROR_MESSAGES } from '../utils/errorMessages';
import { IAuthService, IUserRegistration, IAuthTokens, IUserWithRole } from '../interfaces/IAuthService';
import bcrypt from 'bcryptjs';
import { subscriptionService } from './subscriptionService';

class AuthService implements IAuthService {

  async validateEmailNotExists(email: string): Promise<void> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw this.createHttpError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
    }
  }

  async createUserWithClientRole(userData: IUserRegistration): Promise<IUserWithRole> {
    const defaultClientRole = await this.findDefaultClientRole();
    const uniqueUserId = generateUserId();
    const newUser = await this.buildAndSaveUser(userData, uniqueUserId, defaultClientRole._id);

    try {
      await subscriptionService.createSubscriptionForUser({ userId: uniqueUserId });
      console.log('✅ Subscription history created successfully.');
    } catch (error) {
      console.log("🚀 ~ UserService ~ createNewUser ~ error:", error)
      console.error(`❌ FAILED to create subscription for user ${uniqueUserId}. Rolling back user creation.`);
      await User.findByIdAndDelete(newUser._id);

      throw error;
    }

    return { user: newUser, role: defaultClientRole };
  }

  async validateUserCredentials(email: string, password: string): Promise<any> {
    const userWithRoles = await this.findUserByEmailWithRoles(email);

    this.validateUserIsActive(userWithRoles);

    const isPasswordValid = await this.comparePassword(password, userWithRoles.password);
    if (!isPasswordValid) {
      throw this.createHttpError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    await this.updateLastLoginTime(userWithRoles);

    return userWithRoles;
  }

  generateAuthTokens(userId: string, email: string, roleNames: string[]): IAuthTokens {
    const accessToken = generateToken({ userId, email, roles: roleNames });
    const refreshToken = generateRefreshToken(userId);
    return { accessToken, refreshToken };
  }

  async getUserWithoutPassword(userId: string): Promise<any> {
    return await User.findOne({ id: userId })
      .populate('rol', 'name')
      .select('-password');
  }

  private async findDefaultClientRole() {
    try {
      let clientRole = await Role.findOne({ name: 'cliente' });

      if (!clientRole) {
        clientRole = new Role({
          id: generateRoleId(),
          name: 'cliente',
          permissions: []
        });
        await clientRole.save();
        console.log(' Default "cliente" role created');
      }

      return clientRole;
    } catch (error) {
      console.error(' Error creating default role:', error);
      throw this.createHttpError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }
  }

  private async buildAndSaveUser(userData: IUserRegistration, userId: string, roleObjectId: any) {
    const newUser = new User({
      id: userId,
      email: userData.email,
      password: userData.password,
      full_name: userData.full_name,
      age: userData.age,
      phone: userData.phone,
      rol: [roleObjectId]
    });

    await newUser.save();
    return newUser;
  }

  private async findUserByEmailWithRoles(email: string) {
    const userFound = await User.findOne({ email }).populate('rol', 'name');
    if (!userFound) {
      throw this.createHttpError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }
    return userFound;
  }

  private validateUserIsActive(user: any): void {
    if (!user.isActive) {
      throw this.createHttpError(ERROR_MESSAGES.ACCOUNT_DEACTIVATED, 403);
    }
  }

  private async updateLastLoginTime(user: any): Promise<void> {
    user.lastLogin = new Date();
    await user.save();
  }

  async comparePassword(incomingPassword: string, currentPassword: string): Promise<boolean> {
    return await bcrypt.compare(incomingPassword, currentPassword);
  }

  extractRoleNames(user: any): string[] {
    return user.rol.map((role: any) => role.name);
  }

  removePasswordFromUserObject(user: any) {
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }


  private createHttpError(message: string, status: number): Error {
    const err = new Error(message);
    (err as any).status = status;
    return err;
  }
}

export const authService = new AuthService(); 