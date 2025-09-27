
import { User } from '../models/User';

export class UserRegistrationDTO {
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
  }): UserRegistrationDTO {
    return new UserRegistrationDTO(
      body.email,
      body.password,
      body.full_name,
      body.age,
      body.phone,
      body.roleIds
    );
  }
}

export class UserCredentialsDTO {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  static fromRequest(body: {
    email: string;
    password: string;
  }): UserCredentialsDTO {
    return new UserCredentialsDTO(body.email, body.password);
  }
}

export class AuthResponseDTO {
  constructor(
    public readonly user: InstanceType<typeof User>,
    public readonly accessToken: string,
    public readonly refreshToken: string
  ) {}
}

export class UserProfileUpdateDTO {
  constructor(
    public readonly fullName?: string,
    public readonly age?: number,
    public readonly phone?: string
  ) {}

  static fromRequest(body: {
    full_name?: string;
    age?: number;
    phone?: string;
  }): UserProfileUpdateDTO {
    return new UserProfileUpdateDTO(
      body.full_name,
      body.age,
      body.phone
    );
  }
}

export class PasswordChangeDTO {
  constructor(
    public readonly currentPassword: string,
    public readonly newPassword: string
  ) {}

  static fromRequest(body: {
    currentPassword: string;
    newPassword: string;
  }): PasswordChangeDTO {
    return new PasswordChangeDTO(
      body.currentPassword,
      body.newPassword
    );
  }
}