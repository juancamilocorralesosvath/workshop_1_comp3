export interface IUserFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ICreateUserData {
  email: string;
  password: string;
  fulll_name: string;
  age: string;
  phone: string;
  roleIds?: string[];
}

export interface IUpdateUserData {
  email?: string;
  fulll_name?: string;
  age?: string;
  phone?: string;
  isActive?: boolean;
}

export interface IPaginatedUsers {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IUserService {
  getAllUsersWithFilters(filters: IUserFilters): Promise<IPaginatedUsers>;
  findUserById(userId: string): Promise<any>;
  createNewUser(userData: ICreateUserData): Promise<any>;
  updateExistingUser(userId: string, updateData: IUpdateUserData): Promise<any>;
  removeUser(userId: string): Promise<void>;
  assignRolesToUser(userId: string, roleIds: string[]): Promise<any>;
  toggleUserActiveStatus(userId: string): Promise<any>;
}