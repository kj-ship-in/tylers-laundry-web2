import { Permission } from '../types/enums';
export const ROLE_HIERARCHY = {
    USER: 1,
    STAFF: 2,
    ADMIN: 3,
};
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
    ADMIN: [...Object.values(Permission)],
};
export const getRolePermissions = (role) => {
    return ROLE_PERMISSIONS[role] ?? [];
};
export const hasPermission = (userPermissions, permission) => {
    return userPermissions.includes(permission);
};
export const hasRoleLevel = (userRole, requiredRole) => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
export const getUserPermissions = (role) => {
    return getRolePermissions(role);
};
export const permissionToString = (permission) => {
    return permission.toLowerCase().replace(/_/g, ':');
};
export const permissionsToStrings = (permissions) => {
    return permissions.map(permissionToString);
};
export const getAllPermissions = () => {
    return Object.values(Permission);
};
