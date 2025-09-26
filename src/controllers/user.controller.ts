import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';
import { SUCCESS_MESSAGES } from '../config/constants';
import { UserService } from '../services/userService';
import { IUserService } from '../interfaces/IUserService';
import { UserFiltersDTO, CreateUserDTO, UpdateUserDTO, UserIdDTO, AssignRolesDTO } from '../dto/UserDTO';

export class UserController {
  private readonly userService: IUserService;

  constructor(userService: IUserService = new UserService()) {
    this.userService = userService;
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = UserFiltersDTO.fromQuery(req.query);
      const paginatedUsers = await this.userService.getAllUsersWithFilters(filters);
      return ResponseHelper.success(res, paginatedUsers, SUCCESS_MESSAGES.USERS_RETRIEVED);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      const userFound = await this.userService.findUserById(userIdentifier.userId);
      return ResponseHelper.success(res, userFound, SUCCESS_MESSAGES.USER_RETRIEVED);
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUserData = CreateUserDTO.fromRequest(req.body);
      const createdUser = await this.userService.createNewUser(newUserData);
      return ResponseHelper.success(res, createdUser, SUCCESS_MESSAGES.USER_CREATED, 201);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      const updateData = UpdateUserDTO.fromRequest(req.body);
      const updatedUser = await this.userService.updateExistingUser(userIdentifier.userId, updateData);
      return ResponseHelper.success(res, updatedUser, SUCCESS_MESSAGES.USER_UPDATED);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      await this.userService.removeUser(userIdentifier.userId);
      return ResponseHelper.success(res, null, SUCCESS_MESSAGES.USER_DELETED);
    } catch (error) {
      next(error);
    }
  };

  assignRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleAssignmentData = AssignRolesDTO.fromRequest(req.body);
      const updatedUser = await this.userService.assignRolesToUser(
        roleAssignmentData.userId,
        roleAssignmentData.roleIds
      );
      return ResponseHelper.success(res, updatedUser, SUCCESS_MESSAGES.ROLES_ASSIGNED);
    } catch (error) {
      next(error);
    }
  };

  toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdentifier = UserIdDTO.fromParams(req.params);
      const updatedUser = await this.userService.toggleUserActiveStatus(userIdentifier.userId);
      const statusMessage = updatedUser.isActive
        ? SUCCESS_MESSAGES.USER_ACTIVATED
        : SUCCESS_MESSAGES.USER_DEACTIVATED;
      return ResponseHelper.success(res, updatedUser, statusMessage);
    } catch (error) {
      next(error);
    }
  };
}