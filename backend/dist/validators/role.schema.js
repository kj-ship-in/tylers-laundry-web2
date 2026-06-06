import { z } from 'zod';
import { Permission } from '../types/enums';
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
export const CreateRoleSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    permissions: z
        .array(z.nativeEnum(Permission))
        .min(1, 'At least one permission is required'),
});
export const UpdateRoleSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    permissions: z.array(z.nativeEnum(Permission)).optional(),
    isActive: z.boolean().optional(),
});
export const AssignPermissionsSchema = z.object({
    permissions: z
        .array(z.nativeEnum(Permission))
        .min(1, 'At least one permission is required'),
});
export const AssignRoleToUserSchema = z.object({
    userId: z.string().regex(mongoIdRegex, 'Invalid user ID'),
    roleId: z.string().regex(mongoIdRegex, 'Invalid role ID'),
});
export const UserPermissionsSchema = z.object({
    permissions: z
        .array(z.nativeEnum(Permission))
        .min(1, 'At least one permission is required'),
});
export const RoleIdSchema = z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid role ID'),
});
export const UserIdSchema = z.object({
    userId: z.string().regex(mongoIdRegex, 'Invalid user ID'),
});
