import { UserRegistrationDTO, UserCredentialsDTO } from '../../src/dto/AuthDTO';
import { CreateUserDTO, UpdateUserDTO } from '../../src/dto/UserDTO';

// Test Users Data
export const validUserRegistrationData = {
  email: 'testuser@example.com',
  password: 'password123',
  fulll_name: 'Test User',
  age: '25',
  phone: '+573001234567',
};

export const validUserCredentials = {
  email: 'testuser@example.com',
  password: 'password123',
};

export const adminCredentials = {
  email: 'admin@gym.com',
  password: 'admin123',
};

export const invalidUserRegistrationData = {
  email: 'invalid-email',
  password: '123', // Too short
  fulll_name: '',
  age: '',
  phone: '',
};

export const mockTokenPayload = {
  userId: 'user_123456789012',
  email: 'testuser@example.com',
  roles: ['cliente'],
};

export const mockAuthTokens = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.refresh',
};

// Test DTOs
export const createValidUserRegistrationDTO = (): UserRegistrationDTO => {
  return new UserRegistrationDTO(
    validUserRegistrationData.email,
    validUserRegistrationData.password,
    validUserRegistrationData.fulll_name,
    validUserRegistrationData.age,
    validUserRegistrationData.phone
  );
};

export const createValidUserCredentialsDTO = (): UserCredentialsDTO => {
  return new UserCredentialsDTO(
    validUserCredentials.email,
    validUserCredentials.password
  );
};

export const createValidCreateUserDTO = (): CreateUserDTO => {
  return new CreateUserDTO(
    'newuser@example.com',
    'password123',
    'New User',
    '28',
    '+573009876543'
  );
};

export const createValidUpdateUserDTO = (): UpdateUserDTO => {
  return new UpdateUserDTO(
    'updated@example.com',
    'Updated Name',
    '30',
    '+573001111111',
    true
  );
};

// Mock Database Documents
export const mockUserDocument = {
  _id: '507f1f77bcf86cd799439011',
  id: 'user_123456789012',
  email: 'testuser@example.com',
  password: '$2a$12$hashedpassword',
  fulll_name: 'Test User',
  age: '25',
  phone: '+573001234567',
  rol: [{
    _id: '507f1f77bcf86cd799439022',
    name: 'cliente'
  }],
  isActive: true,
  lastLogin: new Date('2025-01-01T00:00:00.000Z'),
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z'),
};

export const mockRoleDocument = {
  _id: '507f1f77bcf86cd799439022',
  id: 'role_123456789012',
  name: 'cliente',
  permissions: ['507f1f77bcf86cd799439033'],
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z'),
};

export const mockPermissionDocument = {
  _id: '507f1f77bcf86cd799439033',
  id: 'perm_123456789012',
  name: 'user.read',
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z'),
};

// Mock API Responses
export const mockSuccessResponse = {
  success: true,
  message: 'Operation successful',
  data: mockUserDocument,
};

export const mockErrorResponse = {
  success: false,
  message: 'Operation failed',
  error: 'Detailed error message',
};