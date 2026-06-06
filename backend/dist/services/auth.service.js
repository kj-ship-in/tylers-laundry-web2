/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../lib/prisma';
import { ConflictError, AuthenticationError, } from '../middlewares/error.middleware';
import { hashPassword } from '../utils/hash';
import { getRelativeExpiry } from '../utils/helper';
import { generateRefreshToken, generateToken } from '../utils/jwt';
import { generateResetToken } from '../utils/token-generator';
import { generateVerificationCode } from '../utils/verification-code-generator';
import { sendEmail } from './email.service';
import { getPermissionsAsStrings } from './permission.service';
const CODE_EXPIRATION_MINUTES = 14;
export const registerUserService = async (data) => {
    const { name, email, password } = data;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ConflictError('A user with this email already exists');
    }
    const hashed = await hashPassword(password);
    // Get the default USER role
    const userRole = await prisma.role.findFirst({
        where: { name: 'USER', isActive: true },
    });
    if (!userRole) {
        throw new Error('Default USER role not found. Please run database seeding.');
    }
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashed,
            roleId: userRole.id,
            isVerified: false,
        },
        include: { role: true },
    });
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000);
    await prisma.emailVerification.upsert({
        where: { userId: user.id },
        update: { code, expiresAt, createdAt: new Date() },
        create: { userId: user.id, code, expiresAt },
    });
    const expiryTime = getRelativeExpiry(expiresAt);
    await sendEmail({
        to: user.email,
        subject: 'Your Verification Code',
        text: 'verification code',
        code: code,
        expiresAt: expiryTime,
    });
    const accessToken = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
    });
    const refreshToken = generateRefreshToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
    });
    await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
        },
    });
    const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        roleId: user.roleId,
        permissions: await getPermissionsAsStrings(user.id),
        phone: user.phone ?? undefined,
        address: user.address ?? undefined,
        profileUrl: user.profileUrl ?? undefined,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
    return {
        success: true,
        message: 'Customer registered successfully. Verification code sent to email.',
        data: {
            user: userProfile,
            accessToken,
            refreshToken,
            expiresIn: '15m',
        },
    };
};
export const registerPrivilegedUserService = async (data, roleName, requestingUserId) => {
    if (roleName === 'USER') {
        throw new Error('Use registerUserService for users');
    }
    // Only admins can create admin or staff accounts
    const requestingUser = await prisma.user.findUnique({
        where: { id: requestingUserId },
        include: { role: true },
    });
    if (!requestingUser) {
        throw new AuthenticationError('Requesting user not found');
    }
    if (roleName === 'ADMIN' && requestingUser.role.name !== 'ADMIN') {
        throw new AuthenticationError('Only admins can create admin accounts');
    }
    if (roleName === 'STAFF' && requestingUser.role.name !== 'ADMIN') {
        throw new AuthenticationError('Only admins can create staff accounts');
    }
    const { name, email, password } = data;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ConflictError('A user with this email already exists');
    }
    const hashed = await hashPassword(password);
    // Get the appropriate role
    const targetRole = await prisma.role.findFirst({
        where: { name: roleName, isActive: true },
    });
    if (!targetRole) {
        throw new Error(`Role ${roleName} not found`);
    }
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashed,
            roleId: targetRole.id,
            isVerified: true,
        },
        include: { role: true },
    });
    const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        roleId: user.roleId,
        permissions: await getPermissionsAsStrings(user.id),
        phone: user.phone ?? undefined,
        address: user.address ?? undefined,
        profileUrl: user.profileUrl ?? undefined,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
    const roleLabel = roleName === 'ADMIN' ? 'Admin' : 'Staff';
    return {
        success: true,
        message: `${roleLabel} registered successfully.`,
        data: {
            user: userProfile,
        },
    };
};
// Keep legacy functions for backward compatibility
export const registerAdmin = async (data, requestingUserId) => {
    return registerPrivilegedUserService(data, 'ADMIN', requestingUserId);
};
export const registerStaff = async (data, requestingUserId) => {
    return registerPrivilegedUserService(data, 'STAFF', requestingUserId);
};
export const registerUser = async (data) => {
    return registerUserService(data);
};
export const login = async (userId) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() },
        include: { role: true },
    });
    const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
    });
    const refreshToken = generateRefreshToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
    });
    await prisma.session.upsert({
        where: {
            userId: user.id,
        },
        update: {
            refreshToken,
            revokedAt: null,
            expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
        },
        create: {
            userId: user.id,
            refreshToken,
            expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
        },
    });
    return {
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                roleId: user.roleId,
                permissions: await getPermissionsAsStrings(user.id),
                phone: user.phone ?? undefined,
                address: user.address ?? undefined,
                profileUrl: user.profileUrl ?? undefined,
                isVerified: user.isVerified,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            },
            accessToken: token,
            refreshToken,
            expiresIn: '15m',
        },
    };
};
export const verifyUserEmail = async (userId, code) => {
    const record = await prisma.emailVerification.findFirst({
        where: { userId, code },
    });
    if (!record) {
        throw new AuthenticationError('Invalid verification code');
    }
    if (record.expiresAt < new Date()) {
        throw new AuthenticationError('Verification code expired');
    }
    const user = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true, verifiedAt: new Date() },
        include: { role: true },
    });
    await prisma.emailVerification.delete({ where: { id: record.id } });
    const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
    });
    const refreshToken = generateRefreshToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
    });
    await prisma.session.upsert({
        where: {
            userId: user.id,
        },
        update: {
            refreshToken,
            revokedAt: null,
            expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
        },
        create: {
            userId: user.id,
            refreshToken,
            expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
        },
    });
    return {
        success: true,
        message: 'Email verified successfully',
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                roleId: user.roleId,
                permissions: await getPermissionsAsStrings(user.id),
                phone: user.phone ?? undefined,
                address: user.address ?? undefined,
                profileUrl: user.profileUrl ?? undefined,
                isVerified: user.isVerified,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            },
            accessToken: token,
            refreshToken,
            expiresIn: '15m',
        },
    };
};
export const requestVerificationCode = async (userId, email) => {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000);
    await prisma.emailVerification.upsert({
        where: { userId },
        update: { code, expiresAt, createdAt: new Date() },
        create: { userId, code, expiresAt },
    });
    const expiryTime = getRelativeExpiry(expiresAt);
    await sendEmail({
        to: email,
        subject: 'Your Kodoo Verification Code',
        text: 'verification code',
        code: code,
        expiresAt: expiryTime,
    });
};
export const requestPasswordReset = async (userId, email) => {
    const resetToken = generateResetToken(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.passwordResetToken.upsert({
        where: { userId },
        update: { resetToken, expiresAt },
        create: { userId, resetToken, expiresAt },
    });
    const expiryTime = getRelativeExpiry(expiresAt);
    await sendEmail({
        to: email,
        subject: 'Reset Your Password',
        text: 'reset token',
        code: resetToken,
        expiresAt: expiryTime,
    });
};
export const validateResetToken = async (token) => {
    const record = await prisma.passwordResetToken.findFirst({
        where: { resetToken: token, expiresAt: { gt: new Date() } },
    });
    if (!record) {
        throw new Error('Invalid reset token');
    }
    if (record.expiresAt < new Date()) {
        throw new Error('Reset token expired');
    }
    return !!record.resetToken;
};
export const resetPassword = async (userId, newPassword) => {
    const storedToken = await prisma.passwordResetToken.findFirst({
        where: { userId },
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new Error('Invalid or expired reset token');
    }
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashed, passwordUpdatedAt: new Date() },
    });
    await prisma.passwordResetToken.delete({ where: { userId } });
};
export const changePassword = async (userId, newPassword) => {
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashed, passwordUpdatedAt: new Date() },
    });
};
export const userExists = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    return !!user;
};
export const findOneByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    return user;
};
export const findOneById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    return user;
};
export const logoutService = async (userId) => {
    const session = await prisma.session.findUnique({
        where: { userId },
    });
    if (!session) {
        throw new Error('Session not found');
    }
    const now = new Date();
    if (session.expiresAt <= now) {
        await prisma.session.update({
            where: { userId },
            data: { revokedAt: now, revoked: true },
        });
        throw new Error('Token already expired');
    }
    await prisma.session.update({
        where: { userId },
        data: { revokedAt: now, revoked: true },
    });
};
export const softDeleteUser = async (userId, deletionReason = 'USER_REQUESTED') => {
    const timestamp = Date.now();
    const anonymizedEmail = `deleted_${timestamp}_${userId.toString().slice(-6)}@deleted.com`;
    const result = await prisma.user.update({
        where: { id: userId },
        data: {
            deletedAt: new Date(),
            email: anonymizedEmail,
            isActive: false,
            deletionReason,
        },
        select: {
            id: true,
            email: true,
            isActive: true,
            deletedAt: true,
            deletionReason: true,
        },
    });
    return result;
};
export const restoreUser = async (userId) => {
    const result = await prisma.user.update({
        where: { id: userId },
        data: {
            deletedAt: null,
            isActive: true,
            deletionReason: null,
        },
        select: {
            id: true,
            email: true,
            isActive: true,
            deletedAt: true,
            deletionReason: true,
        },
    });
    return result;
};
