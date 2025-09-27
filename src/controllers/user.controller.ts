import { Request, Response, NextFunction } from 'express';
import { SUCCESS_MESSAGES } from '../utils/successMessages';
import { userService } from '../services/userService';
import { CreateUserDTO, UpdateUserDTO, UserIdDTO, AssignRolesDTO } from '../dto/UserDTO';

export class UserController {
  
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paginatedUsers = await userService.findAll();
      return res.status(200).json(paginatedUsers)
      
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      const userFound = await userService.findUserById(userIdentifier.userId);
      return res.status(200).json(userFound)
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUserData = CreateUserDTO.fromRequest(req.body);
      const createdUser = await userService.createNewUser(newUserData);
      return res.status(201).json(createdUser);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      const updateData = UpdateUserDTO.fromRequest(req.body);
      const updatedUser = await userService.updateExistingUser(userIdentifier.userId, updateData);
      return res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      await userService.removeUser(userIdentifier.userId);
      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  assignRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleAssignmentData = AssignRolesDTO.fromRequest(req.body);
      const updatedUser = await userService.assignRolesToUser(
        roleAssignmentData.userId,
        roleAssignmentData.roleIds
      );
      return res.status(200).json(updatedUser)
    } catch (error) {
      next(error);
    }
  };

  toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      const updatedUser = await userService.toggleUserActiveStatus(userIdentifier.userId);
      const statusMessage = updatedUser.isActive
        ? SUCCESS_MESSAGES.USER_ACTIVATED
        : SUCCESS_MESSAGES.USER_DEACTIVATED;
      
      return res.status(200).json(updatedUser)
    } catch (error) {
      next(error);
    }
  };
}