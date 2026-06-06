"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePictureService = exports.updateProfileDetailsService = exports.getCurrentUserService = exports.getUserStatsService = exports.updateUserRoleService = exports.getStaffsService = exports.getCustomersService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const booking_model_1 = require("../models/booking.model");
const role_model_1 = require("../models/role.model");
const user_model_1 = require("../models/user.model");
const permission_service_1 = require("./permission.service");
const emptyPagination = (page) => ({
    currentPage: page,
    totalPages: 0,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
});
const buildUserPayload = async (user) => {
    const uid = user._id.toString();
    const bookingsCount = await booking_model_1.Booking.countDocuments({ userId: user._id });
    return {
        id: uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.roleId?.name ?? 'USER',
        roleId: user.roleId?._id?.toString() ?? '',
        permissions: await (0, permission_service_1.getPermissionsAsStrings)(uid),
        customPermissions: user.permissions,
        isVerified: user.isVerified,
        isBiometricsEnabled: user.isBiometricsEnabled,
        profileUrl: user.profileUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        deletedAt: user.deletedAt,
        deletionReason: user.deletionReason,
        bookingsCount,
    };
};
const getCustomersService = async (options) => {
    const { page = 1, limit = 10, search, includeDeleted = false } = options ?? {};
    const skip = (page - 1) * limit;
    const userRole = await role_model_1.Role.findOne({ name: 'USER' });
    if (!userRole)
        return { users: [], pagination: emptyPagination(page) };
    const query = { roleId: userRole._id };
    if (!includeDeleted)
        query.deletedAt = null;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    const [users, total] = await Promise.all([
        user_model_1.User.find(query).populate('roleId').sort({ createdAt: -1 }).skip(skip).limit(limit),
        user_model_1.User.countDocuments(query),
    ]);
    const usersWithPermissions = await Promise.all(users.map(buildUserPayload));
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
exports.getCustomersService = getCustomersService;
const getStaffsService = async (options) => {
    const { page = 1, limit = 10, search, includeDeleted = false } = options ?? {};
    const skip = (page - 1) * limit;
    const staffRole = await role_model_1.Role.findOne({ name: 'STAFF' });
    if (!staffRole)
        return { users: [], pagination: emptyPagination(page) };
    const query = { roleId: staffRole._id };
    if (!includeDeleted)
        query.deletedAt = null;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    const [users, total] = await Promise.all([
        user_model_1.User.find(query).populate('roleId').sort({ createdAt: -1 }).skip(skip).limit(limit),
        user_model_1.User.countDocuments(query),
    ]);
    const usersWithPermissions = await Promise.all(users.map(buildUserPayload));
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
exports.getStaffsService = getStaffsService;
const updateUserRoleService = async (userId, newRoleName) => {
    const existingUser = await user_model_1.User.findById(userId).populate('roleId');
    if (!existingUser)
        throw new Error('User not found');
    if (existingUser.roleId?.name === newRoleName) {
        throw new Error(`User already has the role: ${newRoleName}`);
    }
    const targetRole = await role_model_1.Role.findOne({ name: newRoleName, isActive: true });
    if (!targetRole)
        throw new Error(`Role ${newRoleName} not found`);
    return user_model_1.User.findByIdAndUpdate(userId, { roleId: targetRole._id }, { new: true }).populate('roleId');
};
exports.updateUserRoleService = updateUserRoleService;
const getUserStatsService = async () => {
    const [userRole, adminRole] = await Promise.all([
        role_model_1.Role.findOne({ name: 'USER' }),
        role_model_1.Role.findOne({ name: 'ADMIN' }),
    ]);
    const [totalUsers, totalAdmins, verifiedUsers, deletedUsers, recentUsers] = await Promise.all([
        userRole ? user_model_1.User.countDocuments({ roleId: userRole._id, deletedAt: null }) : 0,
        adminRole ? user_model_1.User.countDocuments({ roleId: adminRole._id, deletedAt: null }) : 0,
        user_model_1.User.countDocuments({ isVerified: true, deletedAt: null }),
        user_model_1.User.countDocuments({ deletedAt: { $ne: null } }),
        user_model_1.User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            deletedAt: null,
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
exports.getUserStatsService = getUserStatsService;
const getCurrentUserService = async (userId) => {
    const user = await user_model_1.User.findById(userId).populate('roleId');
    if (!user)
        throw new Error('User not found');
    const uid = user._id.toString();
    return {
        id: uid,
        name: user.name,
        email: user.email,
        role: user.roleId?.name ?? 'USER',
        roleId: user.roleId?._id?.toString() ?? '',
        permissions: await (0, permission_service_1.getPermissionsAsStrings)(uid),
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
exports.getCurrentUserService = getCurrentUserService;
const updateProfileDetailsService = async (userId, data) => {
    return user_model_1.User.findByIdAndUpdate(userId, data, { new: true });
};
exports.updateProfileDetailsService = updateProfileDetailsService;
const updateProfilePictureService = async (userId, profileUrl) => {
    return user_model_1.User.findByIdAndUpdate(userId, { profileUrl }, { new: true });
};
exports.updateProfilePictureService = updateProfilePictureService;
