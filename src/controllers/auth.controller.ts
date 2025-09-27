import { Request, Response, NextFunction } from 'express';
import { SUCCESS_MESSAGES } from '../utils/successMessages';
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

      const userWithoutPassword = await authService.getUserWithoutPassword(createdUser.id);

      const authTokens = authService.generateAuthTokens(
        createdUser.id,
        createdUser.email,
        [assignedRole.name]
      );

      const authResponse = new AuthResponseDTO(userWithoutPassword, authTokens.accessToken, authTokens.refreshToken);
      return res.status(200).json(authResponse)

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

      return res.status(200).json(authResponse);
    } catch (error) {
      next(error);
    }
  };



  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await authService.getUserWithoutPassword(req.user.userId);
      return res.status(200).json(user);

    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });


      }

      const profileUpdateData = UserProfileUpdateDTO.fromRequest(req.body);

      const user = await User.findOne({ id: req.user.userId });
      if (!user) {
        return res.status(404).json({ message: 'Not Found' });

      }

      if (profileUpdateData.fullName) user.full_name = profileUpdateData.fullName;
      if (profileUpdateData.age) user.age = profileUpdateData.age;
      if (profileUpdateData.phone) user.phone = profileUpdateData.phone;

      await user.save();

      const updatedUser = await authService.getUserWithoutPassword(user.id);


      return res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      }

      const passwordChangeData = PasswordChangeDTO.fromRequest(req.body);

      if (passwordChangeData.newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      const user = await User.findOne({ _id: req.user.userId }); 
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isCurrentPasswordValid = await user.comparePassword(passwordChangeData.currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      
      user.password = passwordChangeData.newPassword;
      await user.save();

      return res.status(200).json({ message: 'Password successfully updated' });
    } catch (error) {
      next(error);
    }
  };



}