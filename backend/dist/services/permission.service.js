import prisma from '../lib/prisma';
/**
 * Get all permissions for a user based on their role and custom permissions
 */
export const getUserPermissions = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    if (!user) {
        return [];
    }
    // Combine role permissions with user's custom permissions
    const rolePermissions = user.role?.permissions ?? [];
    const customPermissions = user.permissions ?? [];
    // Merge permissions (custom permissions can override role permissions)
    const allPermissions = [
        ...new Set([...rolePermissions, ...customPermissions]),
    ];
    return allPermissions;
};
/**
 * Check if a user has a specific permission
 */
export const hasPermission = (userPermissions, permission) => {
    return userPermissions.includes(permission);
};
/**
 * Check if a user has a specific permission by user ID
 */
export const userHasPermission = async (userId, permission) => {
    const userPermissions = await getUserPermissions(userId);
    return hasPermission(userPermissions, permission);
};
/**
 * Get permissions as string array for API responses
 */
export const getPermissionsAsStrings = async (userId) => {
    const permissions = await getUserPermissions(userId);
    return permissions.map(p => p.toLowerCase().replace(/_/g, ':'));
};
/**
 * Check if user has any of the required permissions
 */
export const userHasAnyPermission = async (userId, permissions) => {
    const userPermissions = await getUserPermissions(userId);
    return permissions.some(permission => hasPermission(userPermissions, permission));
};
