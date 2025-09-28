import { nanoid } from 'nanoid';

export const generateUserId = (): string => {
  return `user_${nanoid(10)}`;
};

export const generateRoleId = (): string => {
  return `role_${nanoid(10)}`;
};

export const generatePermissionId = (): string => {
  return `perm_${nanoid(10)}`;
};

export const generateMembershipId = (): string => {
  return `membership_${nanoid(10)}`;
};

export const generateAttendanceId = (): string => {
  return `attendance_${nanoid(10)}`;
};

export const generateSubscriptionId = (): string => {
  return `subscription_${nanoid(10)}`;
};