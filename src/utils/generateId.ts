import { randomUUID } from 'crypto';

export const generateUserId = (): string => {
  return `user_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
};

export const generateRoleId = (): string => {
  return `role_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
};

export const generatePermissionId = (): string => {
  return `perm_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
};