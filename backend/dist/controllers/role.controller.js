"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserPermissionsController = exports.addUserPermissionsController = exports.resetUserPermissionsController = exports.assignRoleToUserController = exports.getAllPermissionsController = exports.assignPermissionsToRoleController = exports.deleteRoleController = exports.updateRoleController = exports.getRoleByIdController = exports.getAllRolesController = exports.createRoleController = void 0;
const roleService = __importStar(require("../services/role.service"));
const role_schema_1 = require("../validators/role.schema");
const createRoleController = async (req, res, next) => {
    try {
        const { name, description, permissions } = role_schema_1.CreateRoleSchema.parse(req.body);
        const role = await roleService.createRole({
            name,
            description,
            permissions,
        });
        res.status(201).json({
            data: role,
            message: 'Role created successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createRoleController = createRoleController;
const getAllRolesController = async (req, res, next) => {
    try {
        const includeInactive = req.query.includeInactive === 'true';
        const roles = await roleService.getAllRoles(includeInactive);
        res.status(200).json(roles);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllRolesController = getAllRolesController;
const getRoleByIdController = async (req, res, next) => {
    try {
        const { id } = role_schema_1.RoleIdSchema.parse(req.params);
        const role = await roleService.getRoleById(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(200).json(role);
    }
    catch (error) {
        next(error);
    }
};
exports.getRoleByIdController = getRoleByIdController;
const updateRoleController = async (req, res, next) => {
    try {
        const { id } = role_schema_1.RoleIdSchema.parse(req.params);
        const { name, description, permissions, isActive } = role_schema_1.UpdateRoleSchema.parse(req.body);
        const role = await roleService.updateRole(id, {
            name,
            description,
            permissions,
            isActive,
        });
        res.status(200).json({
            data: role,
            message: 'Role updated successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRoleController = updateRoleController;
const deleteRoleController = async (req, res, next) => {
    try {
        const { id } = role_schema_1.RoleIdSchema.parse(req.params);
        await roleService.deleteRole(id);
        res.status(200).json({
            message: 'Role deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRoleController = deleteRoleController;
const assignPermissionsToRoleController = async (req, res, next) => {
    try {
        const { id } = role_schema_1.RoleIdSchema.parse(req.params);
        const { permissions } = role_schema_1.AssignPermissionsSchema.parse(req.body);
        const role = await roleService.assignPermissionsToRole(id, permissions);
        res.status(200).json({
            data: role,
            message: 'Permissions assigned to role successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.assignPermissionsToRoleController = assignPermissionsToRoleController;
const getAllPermissionsController = async (_req, res, next) => {
    try {
        const permissions = roleService.getAllPermissions();
        res.status(200).json(permissions);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPermissionsController = getAllPermissionsController;
const assignRoleToUserController = async (req, res, next) => {
    try {
        const { userId, roleId } = role_schema_1.AssignRoleToUserSchema.parse(req.body);
        const user = await roleService.assignRoleToUser(userId, roleId);
        res.status(200).json({
            data: user,
            message: 'Role assigned to user successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.assignRoleToUserController = assignRoleToUserController;
const resetUserPermissionsController = async (req, res, next) => {
    try {
        const { userId } = role_schema_1.UserIdSchema.parse(req.params);
        const user = await roleService.resetUserPermissions(userId);
        res.status(200).json({
            data: user,
            message: 'User permissions reset successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetUserPermissionsController = resetUserPermissionsController;
const addUserPermissionsController = async (req, res, next) => {
    try {
        const { userId } = role_schema_1.UserIdSchema.parse(req.params);
        const { permissions } = role_schema_1.UserPermissionsSchema.parse(req.body);
        const user = await roleService.addUserPermissions(userId, permissions);
        res.status(200).json({
            data: user,
            message: 'Permissions added to user successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addUserPermissionsController = addUserPermissionsController;
const removeUserPermissionsController = async (req, res, next) => {
    try {
        const { userId } = role_schema_1.UserIdSchema.parse(req.params);
        const { permissions } = role_schema_1.UserPermissionsSchema.parse(req.body);
        const user = await roleService.removeUserPermissions(userId, permissions);
        res.status(200).json({
            data: user,
            message: 'Permissions removed from user successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeUserPermissionsController = removeUserPermissionsController;
