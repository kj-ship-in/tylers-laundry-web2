import { Permission } from '../prisma/generated/prisma';
// Role hierarchy levels (for backward compatibility)
export const ROLE_HIERARCHY = {
    USER: 1,
    STAFF: 2,
    ADMIN: 3,
};
// Default permissions by role (for system roles)
export const ROLE_PERMISSIONS = {
    USER: [
        Permission.PROFILE_VIEW_OWN,
        Permission.PROFILE_UPDATE_OWN,
        Permission.BOOKING_VIEW_OWN,
        Permission.BOOKING_CREATE,
        Permission.TESTIMONIAL_VIEW,
        Permission.TESTIMONIAL_CREATE,
        Permission.SERVICE_VIEW,
    ],
    STAFF: [
        Permission.PROFILE_VIEW_OWN,
        Permission.PROFILE_UPDATE_OWN,
        Permission.BOOKING_VIEW_ALL,
        Permission.BOOKING_UPDATE_STATUS,
        Permission.SERVICE_VIEW,
        Permission.SERVICE_UPDATE,
        Permission.ANALYTICS_VIEW,
        Permission.REPORTS_VIEW,
        Permission.USER_VIEW,
        Permission.USER_UPDATE,
    ],
    ADMIN: [
        // All permissions for admin
        ...Object.values(Permission),
    ],
};
/**
 * Get permissions for a specific role (for backward compatibility)
 */
export const getRolePermissions = (role) => {
    return ROLE_PERMISSIONS[role] || [];
};
/**
 * Check if a role has a specific permission
 */
export const hasPermission = (userPermissions, permission) => {
    return userPermissions.includes(permission);
};
/**
 * Check if a role has higher or equal hierarchy level
 */
export const hasRoleLevel = (userRole, requiredRole) => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
/**
 * Get all permissions for a user based on their role (for backward compatibility)
 */
export const getUserPermissions = (role) => {
    return getRolePermissions(role);
};
/**
 * Convert permission enum to string format for frontend
 */
export const permissionToString = (permission) => {
    return permission.toLowerCase().replace(/_/g, ':');
};
/**
 * Convert permissions array to string format for frontend
 */
export const permissionsToStrings = (permissions) => {
    return permissions.map(permissionToString);
};
/**
 * Get all available permissions
 */
export const getAllPermissions = () => {
    return Object.values(Permission);
};
