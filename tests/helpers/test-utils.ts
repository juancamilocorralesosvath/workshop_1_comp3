import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../../src/models/User';
import { Role } from '../../src/models/Role';
import { Membership } from '../../src/models/Membership';
import { Subscription } from '../../src/models/Subscription';
import { generateUserId, generateMembershipId, generateSubscriptionId } from '../../src/utils/generateId';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export const createTestUser = async (roleNames: string[] = ['cliente']) => {
  const roles = await Role.find({ name: { $in: roleNames } });
  const hashedPassword = await bcrypt.hash('testpassword123', 10);

  const userData = {
    id: generateUserId(),
    email: `test${Date.now()}@example.com`,
    password: hashedPassword,
    full_name: 'Test User',
    age: 25,
    phone: '1234567890',
    rol: roles.map(r => r._id),
    isActive: true
  };

  const user = await new User(userData).save();
  return user;
};

export const createTestMembership = async (name?: string, price?: number) => {
  const membershipData = {
    id: generateMembershipId(),
    name: name || `Test Membership ${Date.now()}`,
    description: 'Test membership description',
    price: price || 50000,
    duration_days: 30,
    isActive: true
  };

  const membership = await new Membership(membershipData).save();
  return membership;
};

export const createTestSubscription = async (userId: string, membershipIds: string[] = []) => {
  const subscriptionData = {
    id: generateSubscriptionId(),
    userId,
    memberships: membershipIds,
    isActive: true
  };

  const subscription = await new Subscription(subscriptionData).save();
  return subscription;
};

export const generateTestToken = (userId: string, email: string, roles: string[] = ['cliente']) => {
  return jwt.sign(
    { userId, email, roles },
    JWT_SECRET,
    { expiresIn: '1h', issuer: 'gym-management-system' }
  );
};

export const generateExpiredToken = (userId: string, email: string, roles: string[] = ['cliente']) => {
  return jwt.sign(
    { userId, email, roles },
    JWT_SECRET,
    { expiresIn: '0s', issuer: 'gym-management-system' }
  );
};

export const generateInvalidToken = () => {
  return 'invalid.jwt.token';
};

export const clearDatabase = async () => {
  await User.deleteMany({});
  await Membership.deleteMany({});
  await Subscription.deleteMany({});
};

export const expectValidationError = (response: any, field: string) => {
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('error');
  expect(response.body.error).toContain(field);
};

export const expectUnauthorized = (response: any) => {
  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty('error');
};

export const expectForbidden = (response: any) => {
  expect(response.status).toBe(403);
  expect(response.body).toHaveProperty('error');
};

export const expectNotFound = (response: any) => {
  expect(response.status).toBe(404);
  expect(response.body).toHaveProperty('error');
};