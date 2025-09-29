import { generateUserId, generateMembershipId, generateSubscriptionId, generateAttendanceId } from '../../src/utils/generateId';

describe('GenerateId Utils', () => {
  describe('generateUserId', () => {
    it('should generate user id with correct prefix', () => {
      const userId = generateUserId();
      expect(userId).toMatch(/^user-/);
      expect(userId.length).toBeGreaterThan(5);
    });

    it('should generate unique ids', () => {
      const id1 = generateUserId();
      const id2 = generateUserId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateMembershipId', () => {
    it('should generate membership id with correct prefix', () => {
      const membershipId = generateMembershipId();
      expect(membershipId).toMatch(/^membership-/);
      expect(membershipId.length).toBeGreaterThan(11);
    });
  });

  describe('generateSubscriptionId', () => {
    it('should generate subscription id with correct prefix', () => {
      const subscriptionId = generateSubscriptionId();
      expect(subscriptionId).toMatch(/^subscription-/);
      expect(subscriptionId.length).toBeGreaterThan(13);
    });
  });

  describe('generateAttendanceId', () => {
    it('should generate attendance id with correct prefix', () => {
      const attendanceId = generateAttendanceId();
      expect(attendanceId).toMatch(/^attendance-/);
      expect(attendanceId.length).toBeGreaterThan(11);
    });
  });
});