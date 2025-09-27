import { User } from '../models/User';

export class CreateUserDTO {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly full_name: string,
    public readonly age: number,
    public readonly phone: string,
    public readonly roleIds?: string[]
  ) {}

  static fromRequest(body: {
    email: string;
    password: string;
    full_name: string;
    age: number;
    phone: string;
    roleIds?: string[];
  }): CreateUserDTO {
    return new CreateUserDTO(
      body.email,
      body.password,
      body.full_name,
      body.age,
      body.phone,
      body.roleIds
    );
  }
}

export class UpdateUserDTO {
  constructor(
    public readonly email?: string,
    public readonly full_name?: string,
    public readonly age?: number,
    public readonly phone?: string,
    public readonly isActive?: boolean
  ) {}

  static fromRequest(body: {
    email?: string;
    full_name?: string;
    age?: number;
    phone?: string;
    isActive?: boolean;
  }): UpdateUserDTO {
    return new UpdateUserDTO(
      body.email,
      body.full_name,
      body.age,
      body.phone,
      body.isActive
    );
  }
}

export class AssignRolesDTO {
  constructor(
    public readonly userId: string,
    public readonly roleIds: string[]
  ) {}

  static fromRequest(body: {
    userId: string;
    roleIds: string[];
  }): AssignRolesDTO {
    return new AssignRolesDTO(body.userId, body.roleIds);
  }
}

export class UserIdDTO {
  constructor(public readonly userId: string) {}

  static fromParams(params: { id: string }): UserIdDTO {
    return new UserIdDTO(params.id);
  }
}

export class CreateRoleDTO {
  constructor(
    public readonly name: string,
    public readonly permissions?: string[]
  ) {}

  static fromRequest(body: {
    name: string;
    permissions?: string[];
  }): CreateRoleDTO {
    return new CreateRoleDTO(body.name, body.permissions);
  }
}

export class CreatePermissionDTO {
  constructor(public readonly name: string) {}

  static fromRequest(body: { name: string }): CreatePermissionDTO {
    return new CreatePermissionDTO(body.name);
  }
}