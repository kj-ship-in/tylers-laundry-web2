/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../lib/prisma';
import { getPermissionsAsStrings } from './permission.service';
export const getCustomersService = async (options) => {
    const { page = 1, limit = 10, search, includeDeleted = false, } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {
        role: { name: 'USER' },
    };
    if (!includeDeleted) {
        where.deletedAt = null;
    }
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                roleId: true,
                role: true,
                permissions: true,
                isVerified: true,
                isBiometricsEnabled: true,
                profileUrl: true,
                createdAt: true,
                updatedAt: true,
                lastLogin: true,
                deletedAt: true,
                deletionReason: true,
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
    ]);
    // Add permissions to each user
    const usersWithPermissions = await Promise.all(users.map(async (user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role.name,
        roleId: user.roleId,
        permissions: await getPermissionsAsStrings(user.id),
        customPermissions: user.permissions,
        isVerified: user.isVerified,
        isBiometricsEnabled: user.isBiometricsEnabled,
        profileUrl: user.profileUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        deletedAt: user.deletedAt,
        deletionReason: user.deletionReason,
        bookingsCount: user._count.bookings,
    })));
    return {
        users: usersWithPermissions,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    };
};
export const getStaffsService = async (options) => {
    const { page = 1, limit = 10, search, includeDeleted = false, } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {
        role: { name: 'STAFF' },
    };
    if (!includeDeleted) {
        where.deletedAt = null;
    }
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                roleId: true,
                role: true,
                permissions: true,
                isVerified: true,
                isBiometricsEnabled: true,
                profileUrl: true,
                createdAt: true,
                updatedAt: true,
                lastLogin: true,
                deletedAt: true,
                deletionReason: true,
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
    ]);
    // Add permissions to each user
    const usersWithPermissions = await Promise.all(users.map(async (user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role.name,
        roleId: user.roleId,
        permissions: await getPermissionsAsStrings(user.id),
        customPermissions: user.permissions,
        isVerified: user.isVerified,
        isBiometricsEnabled: user.isBiometricsEnabled,
        profileUrl: user.profileUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        deletedAt: user.deletedAt,
        deletionReason: user.deletionReason,
        bookingsCount: user._count.bookings,
    })));
    return {
        users: usersWithPermissions,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    };
};
export const updateUserRoleService = async (userId, newRoleName) => {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    if (!existingUser) {
        throw new Error('User not found');
    }
    if (existingUser.role.name === newRoleName) {
        throw new Error(`User already has the role: ${newRoleName}`);
    }
    // Find the target role
    const targetRole = await prisma.role.findFirst({
        where: { name: newRoleName, isActive: true },
    });
    if (!targetRole) {
        throw new Error(`Role ${newRoleName} not found`);
    }
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            roleId: targetRole.id,
            updatedAt: new Date(),
        },
        include: { role: true },
    });
    return updatedUser;
};
export const getUserStatsService = async () => {
    const [totalUsers, totalAdmins, verifiedUsers, deletedUsers, recentUsers] = await Promise.all([
        prisma.user.count({ where: { role: { name: 'USER' }, deletedAt: null } }),
        prisma.user.count({
            where: { role: { name: 'ADMIN' }, deletedAt: null },
        }),
        prisma.user.count({ where: { isVerified: true, deletedAt: null } }),
        prisma.user.count({ where: { deletedAt: { not: null } } }),
        prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
                deletedAt: null,
            },
        }),
    ]);
    return {
        totalUsers,
        totalAdmins,
        verifiedUsers,
        deletedUsers,
        recentUsers,
        unverifiedUsers: totalUsers + totalAdmins - verifiedUsers,
    };
};
export const getCurrentUserService = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    if (!user) {
        throw new Error('User not found');
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        roleId: user.roleId,
        permissions: await getPermissionsAsStrings(user.id),
        phone: user.phone ?? undefined,
        address: user.address ?? undefined,
        profileUrl: user.profileUrl ?? undefined,
        isActive: user.isActive,
        isBiometricsEnabled: user.isBiometricsEnabled,
        pin: user.pin ?? undefined,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};
export const updateProfileDetailsService = async (userId, data) => {
    return await prisma.user.update({
        where: { id: userId },
        data,
    });
};
export const updateProfilePictureService = async (userId, profileUrl) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { profileUrl },
    });
};
