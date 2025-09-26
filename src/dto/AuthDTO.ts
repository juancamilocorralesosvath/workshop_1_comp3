export class UserRegistrationDTO {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly full_name: string,
    public readonly age: string,
    public readonly phone: string
  ) {}

  static fromRequest(body: any): UserRegistrationDTO {
    return new UserRegistrationDTO(
      body.email,
      body.password,
      body.full_name,
      body.age,
      body.phone
    );
  }
}

export class UserCredentialsDTO {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  static fromRequest(body: any): UserCredentialsDTO {
    return new UserCredentialsDTO(body.email, body.password);
  }
}

export class AuthResponseDTO {
  constructor(
    public readonly user: any,
    public readonly accessToken: string,
    public readonly refreshToken: string
  ) {}
}

export class UserProfileUpdateDTO {
  constructor(
    public readonly fullName?: string,
    public readonly age?: string,
    public readonly phone?: string
  ) {}

  static fromRequest(body: any): UserProfileUpdateDTO {
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

  static fromRequest(body: any): PasswordChangeDTO {
    return new PasswordChangeDTO(
      body.currentPassword,
      body.newPassword
    );
  }
}