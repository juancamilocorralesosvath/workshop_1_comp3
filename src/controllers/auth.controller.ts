import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { ResponseHelper } from '../utils/response';
import { generateUserId } from '../utils/generateId';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fulll_name, age, phone } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ResponseHelper.conflict(res, 'Email already registered');
      }

      const clientRole = await Role.findOne({ name: 'cliente' });
      if (!clientRole) {
        return ResponseHelper.error(res, 'Default role not found. Please contact administrator.', 500);
      }

      const userId = generateUserId();

      const user = new User({
        id: userId,
        email,
        password,
        fulll_name,
        age,
        phone,
        rol: [clientRole._id]
      });

      await user.save();

      const userWithRoles = await User.findById(user._id).populate('rol', 'name').select('-password');

      const token = generateToken({
        userId: user.id,
        email: user.email,
        roles: [clientRole.name]
      });

      const refreshToken = generateRefreshToken(user.id);

      return ResponseHelper.success(res, {
        user: userWithRoles,
        token,
        refreshToken
      }, 'User registered successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).populate('rol', 'name');
      if (!user) {
        return ResponseHelper.unauthorized(res, 'Invalid email or password');
      }

      if (!user.isActive) {
        return ResponseHelper.unauthorized(res, 'Account is deactivated');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return ResponseHelper.unauthorized(res, 'Invalid email or password');
      }

      user.lastLogin = new Date();
      await user.save();

      const roleNames = user.rol.map((role: any) => role.name);

      const token = generateToken({
        userId: user.id,
        email: user.email,
        roles: roleNames
      });

      const refreshToken = generateRefreshToken(user.id);

      const userResponse = user.toObject();
      delete userResponse.password;

      return ResponseHelper.success(res, {
        user: userResponse,
        token,
        refreshToken
      }, 'Login successful');

    } catch (error) {
      next(error);
    }
  }

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