import { jest } from '@jest/globals';

// Mock para Mongoose
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  id: 'user_123456789012',
  email: 'test@example.com',
  password: '$2a$12$hashedpassword',
  fulll_name: 'Test User',
  age: '25',
  phone: '+573001234567',
  rol: ['507f1f77bcf86cd799439022'],
  isActive: true,
  lastLogin: new Date(),
  comparePassword: jest.fn(),
  save: jest.fn(),
  toObject: jest.fn().mockReturnValue({
    _id: '507f1f77bcf86cd799439011',
    id: 'user_123456789012',
    email: 'test@example.com',
    fulll_name: 'Test User',
    age: '25',
    phone: '+573001234567',
    rol: ['507f1f77bcf86cd799439022'],
    isActive: true,
  }),
};

export const mockRole = {
  _id: '507f1f77bcf86cd799439022',
  id: 'role_123456789012',
  name: 'cliente',
  permissions: ['507f1f77bcf86cd799439033'],
};

export const mockPermission = {
  _id: '507f1f77bcf86cd799439033',
  id: 'perm_123456789012',
  name: 'user.read',
};

// Mock para modelos de Mongoose
export const mockUserModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
  new: jest.fn(),
};

export const mockRoleModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
};

export const mockPermissionModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
};

// Mock constructor para modelos
export const createMockModel = (mockData: any) => {
  return jest.fn().mockImplementation(() => ({
    ...mockData,
    save: jest.fn().mockResolvedValue(mockData),
    toObject: jest.fn().mockReturnValue(mockData),
  }));
};