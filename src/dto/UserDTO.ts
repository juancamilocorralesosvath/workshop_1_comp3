export class UserFiltersDTO {
  constructor(
    public readonly search?: string,
    public readonly isActive?: boolean,
    public readonly page?: number,
    public readonly limit?: number
  ) {}

  static fromQuery(query: any): UserFiltersDTO {
    return new UserFiltersDTO(
      query.search,
      query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
      parseInt(query.page) || undefined,
      parseInt(query.limit) || undefined
    );
  }
}

export class CreateUserDTO {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly full_name: string,
    public readonly age: string,
    public readonly phone: string,
    public readonly roleIds?: string[]
  ) {}

  static fromRequest(body: any): CreateUserDTO {
    return new CreateUserDTO(
      body.email,
      body.password,
      body.fulll_name,
      body.age,
      body.phone,
      body.roleIds
    );
  }
}

export class UpdateUserDTO {
  constructor(
    public readonly email?: string,
    public readonly fullName?: string,
    public readonly age?: string,
    public readonly phone?: string,
    public readonly isActive?: boolean
  ) {}

  static fromRequest(body: any): UpdateUserDTO {
    return new UpdateUserDTO(
      body.email,
      body.fulll_name,
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

  static fromRequest(body: any): AssignRolesDTO {
    return new AssignRolesDTO(body.userId, body.roleIds);
  }
}

export class UserIdDTO {
  constructor(public readonly userId: string) {}

  static fromParams(params: any): UserIdDTO {
    return new UserIdDTO(params.id);
  }
}

export class CreateRoleDTO {
  constructor(
    public readonly name: string,
    public readonly permissions?: string[]
  ) {}

  static fromRequest(body: any): CreateRoleDTO {
    return new CreateRoleDTO(body.name, body.permissions);
  }
}

export class CreatePermissionDTO {
  constructor(public readonly name: string) {}

  static fromRequest(body: any): CreatePermissionDTO {
    return new CreatePermissionDTO(body.name);
  }
}