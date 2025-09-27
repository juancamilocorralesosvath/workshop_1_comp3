export interface IUserFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ICreateUserData {
  email: string;
  password: string;
  full_name: string;
  age: number;
  phone: string;
  roleIds?: string[];
}

export interface IUpdateUserData {
  email?: string;
  full_name?: string;
  age?: number;
  phone?: string;
  isActive?: boolean;
}


export interface IUserService {

  findUserById(userId: string): Promise<any>;
  createNewUser(userData: ICreateUserData): Promise<any>;
  updateExistingUser(userId: string, updateData: IUpdateUserData): Promise<any>;
  removeUser(userId: string): Promise<void>;
  assignRolesToUser(userId: string, roleIds: string[]): Promise<any>;
  toggleUserActiveStatus(userId: string): Promise<any>;
}