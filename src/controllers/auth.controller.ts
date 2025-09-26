import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';
import { SUCCESS_MESSAGES } from '../config/constants';
import { AuthService } from '../services/authService';
import { UserRegistrationDTO, UserCredentialsDTO, AuthResponseDTO } from '../dto/AuthDTO';
import { IAuthService } from '../interfaces/IAuthService';

export class AuthController {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService = new AuthService()) {
    this.authService = authService;
  }

  registerNewUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const registrationData = UserRegistrationDTO.fromRequest(req.body);

      await this.authService.validateEmailNotExists(registrationData.email);

      const { user: createdUser, role: assignedRole } = await this.authService.createUserWithClientRole(registrationData);

      const userWithoutPassword = await this.authService.getUserWithoutPassword(createdUser._id);

      const authTokens = this.authService.generateAuthTokens(
        createdUser.id,
        createdUser.email,
        [assignedRole.name]
      );

      const authResponse = new AuthResponseDTO(userWithoutPassword, authTokens.accessToken, authTokens.refreshToken);

      return ResponseHelper.success(res, authResponse, SUCCESS_MESSAGES.USER_REGISTERED, 201);

    } catch (error) {
      next(error);
    }
  };

  authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const credentials = UserCredentialsDTO.fromRequest(req.body);

      const authenticatedUser = await this.authService.validateUserCredentials(credentials.email, credentials.password);

      const roleNames = this.authService.extractRoleNames(authenticatedUser);

      const authTokens = this.authService.generateAuthTokens(
        authenticatedUser.id,
        authenticatedUser.email,
        roleNames
      );

      const userWithoutPassword = this.authService.removePasswordFromUserObject(authenticatedUser);

      const authResponse = new AuthResponseDTO(userWithoutPassword, authTokens.accessToken, authTokens.refreshToken);

      return ResponseHelper.success(res, authResponse, SUCCESS_MESSAGES.LOGIN_SUCCESSFUL);

    } catch (error) {
      next(error);
    }
  };

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseHelper.unauthorized(res, 'Refresh token is required');
      }

      const decoded = require('jsonwebtoken').verify(refreshToken, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');

      const user = await User.findOne({ id: decoded.userId }).populate('rol', 'name');
      if (!user || !user.isActive) {
        return ResponseHelper.unauthorized(res, 'User not found or deactivated');
      }

      const roleNames = user.rol.map((role: any) => role.name);

      const newToken = generateToken({
        userId: user.id,
        email: user.email,
        roles: roleNames
      });

      const newRefreshToken = generateRefreshToken(user.id);

      return ResponseHelper.success(res, {
        token: newToken,
        refreshToken: newRefreshToken
      }, 'Token refreshed successfully');

    } catch (error) {
      return ResponseHelper.unauthorized(res, 'Invalid refresh token');
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      return ResponseHelper.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      const user = await User.findOne({ id: req.user.userId }).populate('rol', 'name').select('-password');
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      return ResponseHelper.success(res, user, 'Profile retrieved successfully');

    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      const { fulll_name, age, phone } = req.body;

      const user = await User.findOne({ id: req.user.userId });
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      if (fulll_name) user.fulll_name = fulll_name;
      if (age) user.age = age;
      if (phone) user.phone = phone;

      await user.save();

      const updatedUser = await User.findById(user._id).populate('rol', 'name').select('-password');

      return ResponseHelper.success(res, updatedUser, 'Profile updated successfully');

    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return ResponseHelper.error(res, 'Current password and new password are required', 400);
      }

      if (newPassword.length < 6) {
        return ResponseHelper.error(res, 'New password must be at least 6 characters', 400);
      }

      const user = await User.findOne({ id: req.user.userId });
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return ResponseHelper.unauthorized(res, 'Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      return ResponseHelper.success(res, null, 'Password changed successfully');

    } catch (error) {
      next(error);
    }
  }
}