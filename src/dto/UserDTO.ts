// Tipos para usuarios
export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  age: number;
  phone: string;
  roleIds?: string[];
}

export interface UpdateUserInput {
  email?: string;
  full_name?: string;
  age?: number;
  phone?: string;
  isActive?: boolean;
}

export interface AssignRolesInput {
  userId: string;
  roleIds: string[];
}

export interface CreateRoleInput {
  name: string;
  permissions?: string[];
}

export interface CreatePermissionInput {
  name: string;
}

// Tipos de parámetros de ruta
export interface UserIdParams {
  id: string;
}