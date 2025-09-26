import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';
import { SUCCESS_MESSAGES } from '../config/constants';
import { authService } from '../services/authService';
import { UserRegistrationDTO, UserCredentialsDTO, AuthResponseDTO, UserProfileUpdateDTO, PasswordChangeDTO } from '../dto/AuthDTO';
import { User } from '../models/User';
import { verifyToken } from '../utils/jwt';



export class AuthController {
  

  registerNewUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const registrationData = UserRegistrationDTO.fromRequest(req.body);
    
      await authService.validateEmailNotExists(registrationData.email);

      const { user: createdUser, role: assignedRole } = await authService.createUserWithClientRole(registrationData);

      const userWithoutPassword = await authService.getUserWithoutPassword(createdUser._id);

      const authTokens = authService.generateAuthTokens(
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

      const authenticatedUser = await authService.validateUserCredentials(credentials.email, credentials.password);

      const roleNames = authService.extractRoleNames(authenticatedUser);

      const authTokens = authService.generateAuthTokens(
        authenticatedUser.id,
        authenticatedUser.email,
        roleNames
      );

      const userWithoutPassword = authService.removePasswordFromUserObject(authenticatedUser);

      const authResponse = new AuthResponseDTO(userWithoutPassword, authTokens.accessToken, authTokens.refreshToken);

      return ResponseHelper.success(res, authResponse, SUCCESS_MESSAGES.LOGIN_SUCCESSFUL);

    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseHelper.unauthorized(res, 'Refresh token is required');
      }

      const decoded = verifyToken(refreshToken);

      const user = await User.findOne({ id: decoded.userId }).populate('rol', 'name');
      if (!user || !user.isActive) {
        return ResponseHelper.unauthorized(res, 'User not found or deactivated');
      }

      const roleNames = authService.extractRoleNames(user);

      const authTokens = authService.generateAuthTokens(user.id, user.email, roleNames);

      return ResponseHelper.success(res, {
        token: authTokens.accessToken,
        refreshToken: authTokens.refreshToken
      }, SUCCESS_MESSAGES.TOKEN_REFRESHED);

    } catch (error) {
      return ResponseHelper.unauthorized(res, 'Invalid refresh token');
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return ResponseHelper.success(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      const user = await authService.getUserWithoutPassword(req.user.userId);
      return ResponseHelper.success(res, user, SUCCESS_MESSAGES.PROFILE_RETRIEVED);

    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      const profileUpdateData = UserProfileUpdateDTO.fromRequest(req.body);

      const user = await User.findOne({ id: req.user.userId });
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      if (profileUpdateData.fullName) user.full_name = profileUpdateData.fullName;
      if (profileUpdateData.age) user.age = profileUpdateData.age;
      if (profileUpdateData.phone) user.phone = profileUpdateData.phone;

      await user.save();

      const updatedUser = await authService.getUserWithoutPassword(user.id);

      return ResponseHelper.success(res, updatedUser, SUCCESS_MESSAGES.PROFILE_UPDATED);

    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      const passwordChangeData = PasswordChangeDTO.fromRequest(req.body);

      if (passwordChangeData.newPassword.length < 6) {
        return ResponseHelper.error(res, 'New password must be at least 6 characters', 400);
      }

      const user = await User.findOne({ id: req.user.userId });
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      const isCurrentPasswordValid = await user.comparePassword(passwordChangeData.currentPassword);
      if (!isCurrentPasswordValid) {
        return ResponseHelper.unauthorized(res, 'Current password is incorrect');
      }

      user.password = passwordChangeData.newPassword;
      await user.save();

      return ResponseHelper.success(res, null, SUCCESS_MESSAGES.PASSWORD_CHANGED);

    } catch (error) {
      next(error);
    }
  };
}