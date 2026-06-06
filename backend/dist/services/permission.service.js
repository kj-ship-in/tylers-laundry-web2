"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userHasAnyPermission = exports.getPermissionsAsStrings = exports.userHasPermission = exports.hasPermission = exports.getUserPermissions = void 0;
const user_model_1 = require("../models/user.model");
const role_model_1 = require("../models/role.model");
const getUserPermissions = async (userId) => {
    const user = await user_model_1.User.findById(userId);
    if (!user)
        return [];
    const role = await role_model_1.Role.findById(user.roleId);
    const rolePermissions = (role?.permissions ?? []);
    const customPermissions = (user.permissions ?? []);
    return [...new Set([...rolePermissions, ...customPermissions])];
};
exports.getUserPermissions = getUserPermissions;
const hasPermission = (userPermissions, permission) => {
    return userPermissions.includes(permission);
};
exports.hasPermission = hasPermission;
const userHasPermission = async (userId, permission) => {
    const userPermissions = await (0, exports.getUserPermissions)(userId);
    return (0, exports.hasPermission)(userPermissions, permission);
};
exports.userHasPermission = userHasPermission;
const getPermissionsAsStrings = async (userId) => {
    const permissions = await (0, exports.getUserPermissions)(userId);
    return permissions.map(p => p.toLowerCase().replace(/_/g, ':'));
};
exports.getPermissionsAsStrings = getPermissionsAsStrings;
const userHasAnyPermission = async (userId, permissions) => {
    const userPermissions = await (0, exports.getUserPermissions)(userId);
    return permissions.some(permission => (0, exports.hasPermission)(userPermissions, permission));
};
exports.userHasAnyPermission = userHasAnyPermission;
