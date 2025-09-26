import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { ResponseHelper } from '../utils/response';
import { generateUserId, generateRoleId, generatePermissionId } from '../utils/generateId';

export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search = '', isActive } = req.query;

      const query: any = {};

      if (search) {
        query.$or = [
          { fulll_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const users = await User.find(query)
        .populate('rol', 'name')
        .select('-password')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      return ResponseHelper.success(res, {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }, 'Users retrieved successfully');

    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await User.findOne({ id }).populate('rol', 'name').select('-password');
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      return ResponseHelper.success(res, user, 'User retrieved successfully');

    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fulll_name, age, phone, roleIds = [] } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ResponseHelper.conflict(res, 'Email already exists');
      }

      let userRoles = [];
      if (roleIds.length > 0) {
        userRoles = await Role.find({ _id: { $in: roleIds } });
        if (userRoles.length !== roleIds.length) {
          return ResponseHelper.error(res, 'One or more roles not found', 400);
        }
      } else {
        const clientRole = await Role.findOne({ name: 'cliente' });
        if (clientRole) {
          userRoles = [clientRole];
        }
      }

      const userId = generateUserId();

      const user = new User({
        id: userId,
        email,
        password,
        fulll_name,
        age,
        phone,
        rol: userRoles.map(role => role._id)
      });

      await user.save();

      const newUser = await User.findById(user._id).populate('rol', 'name').select('-password');

      return ResponseHelper.success(res, newUser, 'User created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, fulll_name, age, phone, isActive } = req.body;

      const user = await User.findOne({ id });
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return ResponseHelper.conflict(res, 'Email already exists');
        }
        user.email = email;
      }

      if (fulll_name) user.fulll_name = fulll_name;
      if (age) user.age = age;
      if (phone) user.phone = phone;
      if (isActive !== undefined) user.isActive = isActive;

      await user.save();

      const updatedUser = await User.findById(user._id).populate('rol', 'name').select('-password');

      return ResponseHelper.success(res, updatedUser, 'User updated successfully');

    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await User.findOne({ id });
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      await User.findByIdAndDelete(user._id);

      return ResponseHelper.success(res, null, 'User deleted successfully');

    } catch (error) {
      next(error);
    }
  }

  static async assignRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, roleIds } = req.body;

      const user = await User.findOne({ id: userId });
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      const roles = await Role.find({ _id: { $in: roleIds } });
      if (roles.length !== roleIds.length) {
        return ResponseHelper.error(res, 'One or more roles not found', 400);
      }

      user.rol = roleIds;
      await user.save();

      const updatedUser = await User.findById(user._id).populate('rol', 'name').select('-password');

      return ResponseHelper.success(res, updatedUser, 'Roles assigned successfully');

    } catch (error) {
      next(error);
    }
  }

  static async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await User.findOne({ id });
      if (!user) {
        return ResponseHelper.notFound(res, 'User not found');
      }

      user.isActive = !user.isActive;
      await user.save();

      const updatedUser = await User.findById(user._id).populate('rol', 'name').select('-password');

      return ResponseHelper.success(res, updatedUser, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);

    } catch (error) {
      next(error);
    }
  }

  // Role management methods
  static async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await Role.find().populate('permissions', 'name');

      return ResponseHelper.success(res, roles, 'Roles retrieved successfully');

    } catch (error) {
      next(error);
    }
  }

  static async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, permissions = [] } = req.body;

      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return ResponseHelper.conflict(res, 'Role already exists');
      }

      if (permissions.length > 0) {
        const validPermissions = await Permission.find({ _id: { $in: permissions } });
        if (validPermissions.length !== permissions.length) {
          return ResponseHelper.error(res, 'One or more permissions not found', 400);
        }
      }

      const roleId = generateRoleId();

      const role = new Role({
        id: roleId,
        name,
        permissions
      });

      await role.save();

      const newRole = await Role.findById(role._id).populate('permissions', 'name');

      return ResponseHelper.success(res, newRole, 'Role created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, permissions } = req.body;

      const role = await Role.findOne({ id });
      if (!role) {
        return ResponseHelper.notFound(res, 'Role not found');
      }

      if (name && name !== role.name) {
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
          return ResponseHelper.conflict(res, 'Role name already exists');
        }
        role.name = name;
      }

      if (permissions) {
        const validPermissions = await Permission.find({ _id: { $in: permissions } });
        if (validPermissions.length !== permissions.length) {
          return ResponseHelper.error(res, 'One or more permissions not found', 400);
        }
        role.permissions = permissions;
      }

      await role.save();

      const updatedRole = await Role.findById(role._id).populate('permissions', 'name');

      return ResponseHelper.success(res, updatedRole, 'Role updated successfully');

    } catch (error) {
      next(error);
    }
  }

  static async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const role = await Role.findOne({ id });
      if (!role) {
        return ResponseHelper.notFound(res, 'Role not found');
      }

      const usersWithRole = await User.findOne({ rol: role._id });
      if (usersWithRole) {
        return ResponseHelper.error(res, 'Cannot delete role. Users are assigned to this role.', 400);
      }

      await Role.findByIdAndDelete(role._id);

      return ResponseHelper.success(res, null, 'Role deleted successfully');

    } catch (error) {
      next(error);
    }
  }

  // Permission management methods
  static async getAllPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await Permission.find();

      return ResponseHelper.success(res, permissions, 'Permissions retrieved successfully');

    } catch (error) {
      next(error);
    }
  }

  static async createPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      const existingPermission = await Permission.findOne({ name });
      if (existingPermission) {
        return ResponseHelper.conflict(res, 'Permission already exists');
      }

      const permissionId = generatePermissionId();

      const permission = new Permission({
        id: permissionId,
        name
      });

      await permission.save();

      return ResponseHelper.success(res, permission, 'Permission created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  static async deletePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const permission = await Permission.findOne({ id });
      if (!permission) {
        return ResponseHelper.notFound(res, 'Permission not found');
      }

      const rolesWithPermission = await Role.findOne({ permissions: permission._id });
      if (rolesWithPermission) {
        return ResponseHelper.error(res, 'Cannot delete permission. Roles are using this permission.', 400);
      }

      await Permission.findByIdAndDelete(permission._id);

      return ResponseHelper.success(res, null, 'Permission deleted successfully');

    } catch (error) {
      next(error);
    }
  }
}