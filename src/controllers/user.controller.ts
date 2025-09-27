import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { ERROR_MESSAGES } from '../utils/errorMessages';
import { CreateUserInput, UpdateUserInput, AssignRolesInput } from '../dto/UserDTO';

export class UserController {
  
  getAllUsers = async (req: Request, res: Response) => {
    try {
      const paginatedUsers = await userService.findAll();
      return res.status(200).json(paginatedUsers);
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({ message: 'Error retrieving users', error: err.message });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'User ID is required' });
      const userFound = await userService.findUserById(id);
      return res.status(200).json(userFound);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error retrieving user', error: err.message });
    }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const newUserData = req.body as CreateUserInput;
      const createdUser = await userService.createNewUser(newUserData);
      return res.status(201).json(createdUser);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.EMAIL_ALREADY_EXISTS) {
        return res.status(409).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error creating user', error: err.message });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'User ID is required' });
      const updateData = req.body as UpdateUserInput;
      const updatedUser = await userService.updateExistingUser(id, updateData);
      return res.status(200).json(updatedUser);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      if (err.message === ERROR_MESSAGES.EMAIL_ALREADY_EXISTS) {
        return res.status(409).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error updating user', error: err.message });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'User ID is required' });
      await userService.removeUser(id);
      return res.status(204).end();
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
  };

  assignRoles = async (req: Request, res: Response) => {
    try {
      const { userId, roleIds } = req.body as AssignRolesInput;
      const updatedUser = await userService.assignRolesToUser(userId, roleIds);
      return res.status(200).json(updatedUser);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND || err.message === ERROR_MESSAGES.ROLE_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error assigning roles', error: err.message });
    }
  };

  toggleUserStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'User ID is required' });
      const updatedUser = await userService.toggleUserActiveStatus(id);
      return res.status(200).json(updatedUser);
    } catch (error) {
      const err = error as Error;
      if (err.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return res.status(404).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Error toggling user status', error: err.message });
    }
  };
}