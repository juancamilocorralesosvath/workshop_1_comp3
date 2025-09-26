export interface IUserRegistration {
  email: string;
  password: string;
  fulll_name: string;
  age: string;
  phone: string;
}

export interface IUserCredentials {
  email: string;
  password: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IUserWithRole {
  user: any;
  role: any;
}

export interface IAuthService {
  validateEmailNotExists(email: string): Promise<void>;
  createUserWithClientRole(userData: IUserRegistration): Promise<IUserWithRole>;
  validateUserCredentials(email: string, password: string): Promise<any>;
  generateAuthTokens(userId: string, email: string, roles: string[]): IAuthTokens;
  getUserWithoutPassword(userId: string): Promise<any>;
}