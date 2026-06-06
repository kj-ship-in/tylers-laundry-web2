import { User } from '../models/user.model';
import { Role } from '../models/role.model';
export const getUserPermissions = async (userId) => {
    const user = await User.findById(userId);
    if (!user)
        return [];
    const role = await Role.findById(user.roleId);
    const rolePermissions = (role?.permissions ?? []);
    const customPermissions = (user.permissions ?? []);
    return [...new Set([...rolePermissions, ...customPermissions])];
};
export const hasPermission = (userPermissions, permission) => {
    return userPermissions.includes(permission);
};
export const userHasPermission = async (userId, permission) => {
    const userPermissions = await getUserPermissions(userId);
    return hasPermission(userPermissions, permission);
};
export const getPermissionsAsStrings = async (userId) => {
    const permissions = await getUserPermissions(userId);
    return permissions.map(p => p.toLowerCase().replace(/_/g, ':'));
};
export const userHasAnyPermission = async (userId, permissions) => {
    const userPermissions = await getUserPermissions(userId);
    return permissions.some(permission => hasPermission(userPermissions, permission));
};
