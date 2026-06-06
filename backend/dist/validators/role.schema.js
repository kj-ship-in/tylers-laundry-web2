import { z } from 'zod';
import { Permission } from '../prisma/generated/prisma';
export const CreateRoleSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    permissions: z
        .array(z.enum(Permission))
        .min(1, 'At least one permission is required'),
});
export const UpdateRoleSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    permissions: z.array(z.enum(Permission)).optional(),
    isActive: z.boolean().optional(),
});
export const AssignPermissionsSchema = z.object({
    permissions: z
        .array(z.enum(Permission))
        .min(1, 'At least one permission is required'),
});
export const AssignRoleToUserSchema = z.object({
    userId: z.number().int().positive('User ID must be a positive integer'),
    roleId: z.number().int().positive('Role ID must be a positive integer'),
});
export const UserPermissionsSchema = z.object({
    permissions: z
        .array(z.enum(Permission))
        .min(1, 'At least one permission is required'),
});
export const RoleIdSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/, 'ID must be a number')
        .transform(val => parseInt(val)),
});
export const UserIdSchema = z.object({
    userId: z
        .string()
        .regex(/^\d+$/, 'User ID must be a number')
        .transform(val => parseInt(val)),
});
