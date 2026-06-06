/* eslint-disable @typescript-eslint/no-explicit-any */
import { Booking } from '../models/booking.model';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { getPermissionsAsStrings } from './permission.service';
const emptyPagination = (page) => ({
    currentPage: page,
    totalPages: 0,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
});
const buildUserPayload = async (user) => {
    const uid = user._id.toString();
    const bookingsCount = await Booking.countDocuments({ userId: user._id });
    return {
        id: uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.roleId?.name ?? 'USER',
        roleId: user.roleId?._id?.toString() ?? '',
        permissions: await getPermissionsAsStrings(uid),
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
export const getCustomersService = async (options) => {
    const { page = 1, limit = 10, search, includeDeleted = false } = options ?? {};
    const skip = (page - 1) * limit;
    const userRole = await Role.findOne({ name: 'USER' });
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
        User.find(query).populate('roleId').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query),
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
export const getStaffsService = async (options) => {
    const { page = 1, limit = 10, search, includeDeleted = false } = options ?? {};
    const skip = (page - 1) * limit;
    const staffRole = await Role.findOne({ name: 'STAFF' });
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
        User.find(query).populate('roleId').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query),
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
export const updateUserRoleService = async (userId, newRoleName) => {
    const existingUser = await User.findById(userId).populate('roleId');
    if (!existingUser)
        throw new Error('User not found');
    if (existingUser.roleId?.name === newRoleName) {
        throw new Error(`User already has the role: ${newRoleName}`);
    }
    const targetRole = await Role.findOne({ name: newRoleName, isActive: true });
    if (!targetRole)
        throw new Error(`Role ${newRoleName} not found`);
    return User.findByIdAndUpdate(userId, { roleId: targetRole._id }, { new: true }).populate('roleId');
};
export const getUserStatsService = async () => {
    const [userRole, adminRole] = await Promise.all([
        Role.findOne({ name: 'USER' }),
        Role.findOne({ name: 'ADMIN' }),
    ]);
    const [totalUsers, totalAdmins, verifiedUsers, deletedUsers, recentUsers] = await Promise.all([
        userRole ? User.countDocuments({ roleId: userRole._id, deletedAt: null }) : 0,
        adminRole ? User.countDocuments({ roleId: adminRole._id, deletedAt: null }) : 0,
        User.countDocuments({ isVerified: true, deletedAt: null }),
        User.countDocuments({ deletedAt: { $ne: null } }),
        User.countDocuments({
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
export const getCurrentUserService = async (userId) => {
    const user = await User.findById(userId).populate('roleId');
    if (!user)
        throw new Error('User not found');
    const uid = user._id.toString();
    return {
        id: uid,
        name: user.name,
        email: user.email,
        role: user.roleId?.name ?? 'USER',
        roleId: user.roleId?._id?.toString() ?? '',
        permissions: await getPermissionsAsStrings(uid),
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
    return User.findByIdAndUpdate(userId, data, { new: true });
};
export const updateProfilePictureService = async (userId, profileUrl) => {
    return User.findByIdAndUpdate(userId, { profileUrl }, { new: true });
};
