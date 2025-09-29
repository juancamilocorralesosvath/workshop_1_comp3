// Global test setup
import { jest } from '@jest/globals';

// Mock nanoid globally
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-id-123')
}));

// Mock other common utilities
jest.mock('../src/utils/generateId', () => ({
  generateUserId: jest.fn(() => 'user_mock-id-123'),
  generateMembershipId: jest.fn(() => 'membership_mock-id-123'),
  generateSubscriptionId: jest.fn(() => 'subscription_mock-id-123'),
  generateAttendanceId: jest.fn(() => 'attendance_mock-id-123'),
  generateRoleId: jest.fn(() => 'role_mock-id-123')
}));

// Console mock to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};