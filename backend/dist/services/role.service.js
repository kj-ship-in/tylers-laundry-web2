import prisma from '../lib/prisma';
import { Permission } from '../prisma/generated/prisma';
/**
 * Create a new role
 */
export const createRole = async (data) => {
    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
        where: { name: data.name },
    });
    if (existingRole) {
        throw new Error('Role with this name already exists');
    }
    return prisma.role.create({
        data: {
            name: data.name,
            description: data.description,
            permissions: data.permissions,
        },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};
/**
 * Get all roles
 */
export const getAllRoles = async (includeInactive = false) => {
    return prisma.role.findMany({
        where: includeInactive ? {} : { isActive: true },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    users: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });
};
/**
 * Get role by ID
 */
export const getRoleById = async (id) => {
    return prisma.role.findUnique({
        where: { id },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    users: true,
                },
            },
        },
    });
};
/**
 * Update role
 */
export const updateRole = async (id, data) => {
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
        where: { id },
    });
    if (!existingRole) {
        throw new Error('Role not found');
    }
    // Check if system role
    if (existingRole.isSystem) {
        throw new Error('Cannot modify system roles');
    }
    // Check if name is being changed and if it conflicts
    if (data.name && data.name !== existingRole.name) {
        const nameConflict = await prisma.role.findUnique({
            where: { name: data.name },
        });
        if (nameConflict) {
            throw new Error('Role with this name already exists');
        }
    }
    return prisma.role.update({
        where: { id },
        data,
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    users: true,
                },
            },
        },
    });
};
/**
 * Delete role (soft delete by setting isActive to false)
 */
export const deleteRole = async (id) => {
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
        where: { id },
        include: {
            users: true,
        },
    });
    if (!existingRole) {
        throw new Error('Role not found');
    }
    // Check if system role
    if (existingRole.isSystem) {
        throw new Error('Cannot delete system roles');
    }
    // Check if role has users
    if (existingRole.users.length > 0) {
        throw new Error('Cannot delete role that has assigned users. Please reassign users first.');
    }
    return prisma.role.update({
        where: { id },
        data: { isActive: false },
    });
};
/**
 * Assign permissions to role
 */
export const assignPermissionsToRole = async (id, permissions) => {
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
        where: { id },
    });
    if (!existingRole) {
        throw new Error('Role not found');
    }
    // Check if system role
    // Allow modifying system roles for now
    // if (existingRole.isSystem) {
    //   throw new Error('Cannot modify permissions of system roles');
    // }
    return prisma.role.update({
        where: { id },
        data: { permissions },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};
/**
 * Get all available permissions
 */
export const getAllPermissions = () => {
    return Object.values(Permission);
};
/**
 * Assign role to user
 */
export const assignRoleToUser = async (userId, roleId) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error('User not found');
    }
    // Check if role exists and is active
    const role = await prisma.role.findUnique({
        where: { id: roleId },
    });
    if (!role?.isActive) {
        throw new Error('Role not found or inactive');
    }
    return prisma.user.update({
        where: { id: userId },
        data: { roleId },
        include: {
            role: true,
        },
    });
};
/**
 * Remove custom permissions from user (reset to role permissions only)
 */
export const resetUserPermissions = async (userId) => {
    return prisma.user.update({
        where: { id: userId },
        data: { permissions: [] },
        include: {
            role: true,
        },
    });
};
/**
 * Add custom permissions to user
 */
export const addUserPermissions = async (userId, permissions) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    if (!user) {
        throw new Error('User not found');
    }
    // Combine existing permissions with new ones (avoid duplicates)
    const existingPermissions = user.permissions || [];
    const allPermissions = [...new Set([...existingPermissions, ...permissions])];
    return prisma.user.update({
        where: { id: userId },
        data: { permissions: allPermissions },
        include: {
            role: true,
        },
    });
};
/**
 * Remove specific permissions from user
 */
export const removeUserPermissions = async (userId, permissions) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const existingPermissions = user.permissions || [];
    const updatedPermissions = existingPermissions.filter(p => !permissions.includes(p));
    return prisma.user.update({
        where: { id: userId },
        data: { permissions: updatedPermissions },
        include: {
            role: true,
        },
    });
};
