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