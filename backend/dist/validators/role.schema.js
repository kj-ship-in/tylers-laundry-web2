"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserIdSchema = exports.RoleIdSchema = exports.UserPermissionsSchema = exports.AssignRoleToUserSchema = exports.AssignPermissionsSchema = exports.UpdateRoleSchema = exports.CreateRoleSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
exports.CreateRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().optional(),
    permissions: zod_1.z
        .array(zod_1.z.nativeEnum(enums_1.Permission))
        .min(1, 'At least one permission is required'),
});
exports.UpdateRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').optional(),
    description: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.nativeEnum(enums_1.Permission)).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.AssignPermissionsSchema = zod_1.z.object({
    permissions: zod_1.z
        .array(zod_1.z.nativeEnum(enums_1.Permission))
        .min(1, 'At least one permission is required'),
});
exports.AssignRoleToUserSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(mongoIdRegex, 'Invalid user ID'),
    roleId: zod_1.z.string().regex(mongoIdRegex, 'Invalid role ID'),
});
exports.UserPermissionsSchema = zod_1.z.object({
    permissions: zod_1.z
        .array(zod_1.z.nativeEnum(enums_1.Permission))
        .min(1, 'At least one permission is required'),
});
exports.RoleIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(mongoIdRegex, 'Invalid role ID'),
});
exports.UserIdSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(mongoIdRegex, 'Invalid user ID'),
});
