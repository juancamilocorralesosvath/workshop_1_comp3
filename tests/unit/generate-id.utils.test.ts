import { generateUserId, generateMembershipId, generateSubscriptionId, generateAttendanceId } from '../../src/utils/generateId';

describe('GenerateId Utils', () => {
  describe('generateUserId', () => {
    it('should generate user id with correct prefix', () => {
      const userId = generateUserId();
      expect(userId).toMatch(/^user/);
      expect(userId.length).toBeGreaterThan(5);
    });

    it('should generate consistent format', () => {
      const userId = generateUserId();
      expect(typeof userId).toBe('string');
      expect(userId).toContain('user');
    });
  });

  describe('generateMembershipId', () => {
    it('should generate membership id with correct prefix', () => {
      const membershipId = generateMembershipId();
      expect(membershipId).toMatch(/^membership/);
      expect(membershipId.length).toBeGreaterThan(10);
    });
  });

  describe('generateSubscriptionId', () => {
    it('should generate subscription id with correct prefix', () => {
      const subscriptionId = generateSubscriptionId();
      expect(subscriptionId).toMatch(/^subscription/);
      expect(subscriptionId.length).toBeGreaterThan(12);
    });
  });

  describe('generateAttendanceId', () => {
    it('should generate attendance id with correct prefix', () => {
      const attendanceId = generateAttendanceId();
      expect(attendanceId).toMatch(/^attendance/);
      expect(attendanceId.length).toBeGreaterThan(10);
    });
  });
});