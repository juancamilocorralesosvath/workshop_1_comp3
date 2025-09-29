// Mock nanoid to return predictable values
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-id-123')
}));

import { generateUserId, generateMembershipId, generateSubscriptionId, generateAttendanceId } from '../../src/utils/generateId';

describe('GenerateId Utils', () => {
  describe('generateUserId', () => {
    it('should generate user id with correct prefix', () => {
      const userId = generateUserId();
      expect(userId).toMatch(/^user_/);
      expect(userId).toContain('user_');
      expect(userId.length).toBeGreaterThan(5);
    });

    it('should generate consistent format', () => {
      const userId = generateUserId();
      expect(typeof userId).toBe('string');
      expect(userId).toContain('user_');
    });
  });

  describe('generateMembershipId', () => {
    it('should generate membership id with correct prefix', () => {
      const membershipId = generateMembershipId();
      expect(membershipId).toMatch(/^membership_/);
      expect(membershipId).toContain('membership_');
      expect(membershipId.length).toBeGreaterThan(10);
    });
  });

  describe('generateSubscriptionId', () => {
    it('should generate subscription id with correct prefix', () => {
      const subscriptionId = generateSubscriptionId();
      expect(subscriptionId).toMatch(/^subscription_/);
      expect(subscriptionId).toContain('subscription_');
      expect(subscriptionId.length).toBeGreaterThan(12);
    });
  });

  describe('generateAttendanceId', () => {
    it('should generate attendance id with correct prefix', () => {
      const attendanceId = generateAttendanceId();
      expect(attendanceId).toMatch(/^attendance_/);
      expect(attendanceId).toContain('attendance_');
      expect(attendanceId.length).toBeGreaterThan(10);
    });
  });
});