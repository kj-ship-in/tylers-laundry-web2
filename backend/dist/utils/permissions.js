"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPermissions = exports.permissionsToStrings = exports.permissionToString = exports.getUserPermissions = exports.hasRoleLevel = exports.hasPermission = exports.getRolePermissions = exports.ROLE_PERMISSIONS = exports.ROLE_HIERARCHY = void 0;
const enums_1 = require("../types/enums");
exports.ROLE_HIERARCHY = {
    USER: 1,
    STAFF: 2,
    ADMIN: 3,
};
exports.ROLE_PERMISSIONS = {
    USER: [
        enums_1.Permission.PROFILE_VIEW_OWN,
        enums_1.Permission.PROFILE_UPDATE_OWN,
        enums_1.Permission.BOOKING_VIEW_OWN,
        enums_1.Permission.BOOKING_CREATE,
        enums_1.Permission.TESTIMONIAL_VIEW,
        enums_1.Permission.TESTIMONIAL_CREATE,
        enums_1.Permission.SERVICE_VIEW,
    ],
    STAFF: [
        enums_1.Permission.PROFILE_VIEW_OWN,
        enums_1.Permission.PROFILE_UPDATE_OWN,
        enums_1.Permission.BOOKING_VIEW_ALL,
        enums_1.Permission.BOOKING_UPDATE_STATUS,
        enums_1.Permission.SERVICE_VIEW,
        enums_1.Permission.SERVICE_UPDATE,
        enums_1.Permission.ANALYTICS_VIEW,
        enums_1.Permission.REPORTS_VIEW,
        enums_1.Permission.USER_VIEW,
        enums_1.Permission.USER_UPDATE,
    ],
    ADMIN: [...Object.values(enums_1.Permission)],
};
const getRolePermissions = (role) => {
    return exports.ROLE_PERMISSIONS[role] ?? [];
};
exports.getRolePermissions = getRolePermissions;
const hasPermission = (userPermissions, permission) => {
    return userPermissions.includes(permission);
};
exports.hasPermission = hasPermission;
const hasRoleLevel = (userRole, requiredRole) => {
    return exports.ROLE_HIERARCHY[userRole] >= exports.ROLE_HIERARCHY[requiredRole];
};
exports.hasRoleLevel = hasRoleLevel;
const getUserPermissions = (role) => {
    return (0, exports.getRolePermissions)(role);
};
exports.getUserPermissions = getUserPermissions;
const permissionToString = (permission) => {
    return permission.toLowerCase().replace(/_/g, ':');
};
exports.permissionToString = permissionToString;
const permissionsToStrings = (permissions) => {
    return permissions.map(exports.permissionToString);
};
exports.permissionsToStrings = permissionsToStrings;
const getAllPermissions = () => {
    return Object.values(enums_1.Permission);
};
exports.getAllPermissions = getAllPermissions;
