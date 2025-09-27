import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { CreateUserDTO, UpdateUserDTO, UserIdDTO, AssignRolesDTO } from '../dto/UserDTO';
import { ERROR_MESSAGES } from '../utils/errorMessages';

export class UserController {
  
  getAllUsers = async (req: Request, res: Response) => {
    try {
      const paginatedUsers = await userService.findAll();
      return res.status(200).json(paginatedUsers);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      const userFound = await userService.findUserById(userIdentifier.userId);
      return res.status(200).json(userFound);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const newUserData = CreateUserDTO.fromRequest(req.body);
      const createdUser = await userService.createNewUser(newUserData);
      return res.status(201).json(createdUser);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.EMAIL_ALREADY_EXISTS) {
        return res.status(409).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      const updateData = UpdateUserDTO.fromRequest(req.body);
      const updatedUser = await userService.updateExistingUser(userIdentifier.userId, updateData);
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === ERROR_MESSAGES.EMAIL_ALREADY_EXISTS) {
        return res.status(409).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      await userService.removeUser(userIdentifier.userId);
      return res.status(204).end();
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  };

  assignRoles = async (req: Request, res: Response) => {
    try {
      const roleAssignmentData = AssignRolesDTO.fromRequest(req.body);
      const updatedUser = await userService.assignRolesToUser(
        roleAssignmentData.userId,
        roleAssignmentData.roleIds
      );
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND || error.message === ERROR_MESSAGES.ROLE_NOT_FOUND) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error assigning roles', error: error.message });
    }
  };

  toggleUserStatus = async (req: Request, res: Response) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      const updatedUser = await userService.toggleUserActiveStatus(userIdentifier.userId);
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error toggling user status', error: error.message });
    }
  };
}