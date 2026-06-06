import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Permission } from '../types/enums';

export const getUserPermissions = async (userId: string): Promise<Permission[]> => {
  const user = await User.findById(userId);

  if (!user) return [];

  const role = await Role.findById(user.roleId);

  const rolePermissions = (role?.permissions ?? []) as Permission[];
  const customPermissions = (user.permissions ?? []) as Permission[];

  return [...new Set([...rolePermissions, ...customPermissions])];
};

export const hasPermission = (
  userPermissions: Permission[],
  permission: Permission,
): boolean => {
  return userPermissions.includes(permission);
};

export const userHasPermission = async (
  userId: string,
  permission: Permission,
): Promise<boolean> => {
  const userPermissions = await getUserPermissions(userId);
  return hasPermission(userPermissions, permission);
};

export const getPermissionsAsStrings = async (userId: string): Promise<string[]> => {
  const permissions = await getUserPermissions(userId);
  return permissions.map(p => p.toLowerCase().replace(/_/g, ':'));
};

export const userHasAnyPermission = async (
  userId: string,
  permissions: Permission[],
): Promise<boolean> => {
  const userPermissions = await getUserPermissions(userId);
  return permissions.some(permission => hasPermission(userPermissions, permission));
};
