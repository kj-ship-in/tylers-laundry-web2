"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreUser = exports.softDeleteUser = exports.logoutService = exports.findOneById = exports.findOneByEmail = exports.userExists = exports.changePassword = exports.resetPassword = exports.validateResetToken = exports.requestPasswordReset = exports.requestVerificationCode = exports.verifyUserEmail = exports.login = exports.registerUser = exports.registerStaff = exports.registerAdmin = exports.registerPrivilegedUserService = exports.registerUserService = void 0;
const email_verification_model_1 = require("../models/email-verification.model");
const password_reset_token_model_1 = require("../models/password-reset-token.model");
const role_model_1 = require("../models/role.model");
const session_model_1 = require("../models/session.model");
const user_model_1 = require("../models/user.model");
const error_middleware_1 = require("../middlewares/error.middleware");
const hash_1 = require("../utils/hash");
const helper_1 = require("../utils/helper");
const jwt_1 = require("../utils/jwt");
const token_generator_1 = require("../utils/token-generator");
const verification_code_generator_1 = require("../utils/verification-code-generator");
const email_service_1 = require("./email.service");
const permission_service_1 = require("./permission.service");
const CODE_EXPIRATION_MINUTES = 14;
const registerUserService = async (data) => {
    const { name, email, password } = data;
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser) {
        throw new error_middleware_1.ConflictError('A user with this email already exists');
    }
    const hashed = await (0, hash_1.hashPassword)(password);
    const userRole = await role_model_1.Role.findOne({ name: 'USER', isActive: true });
    if (!userRole) {
        throw new Error('Default USER role not found. Please run database seeding.');
    }
    const user = await user_model_1.User.create({
        name,
        email,
        password: hashed,
        roleId: userRole._id,
        isVerified: false,
    });
    const populatedUser = await user_model_1.User.findById(user._id).populate('roleId');
    const code = (0, verification_code_generator_1.generateVerificationCode)();
    const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000);
    await email_verification_model_1.EmailVerification.findOneAndUpdate({ userId: user._id }, { userId: user._id, code, expiresAt, createdAt: new Date() }, { upsert: true, new: true });
    const expiryTime = (0, helper_1.getRelativeExpiry)(expiresAt);
    await (0, email_service_1.sendEmail)({
        to: user.email,
        subject: 'Your Verification Code',
        text: 'verification code',
        code,
        expiresAt: expiryTime,
    });
    const role = populatedUser?.roleId?.name ?? 'USER';
    const userId = user._id.toString();
    const accessToken = (0, jwt_1.generateToken)({ id: userId, name: user.name, email: user.email, role });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: userId, name: user.name, email: user.email, role });
    await session_model_1.Session.findOneAndUpdate({ userId: user._id }, {
        userId: user._id,
        refreshToken,
        expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
    }, { upsert: true, new: true });
    const userProfile = {
        id: userId,
        name: user.name,
        email: user.email,
        role,
        roleId: userRole._id.toString(),
        permissions: await (0, permission_service_1.getPermissionsAsStrings)(userId),
        phone: user.phone,
        address: user.address,
        profileUrl: user.profileUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
    return {
        success: true,
        message: 'Customer registered successfully. Verification code sent to email.',
        data: { user: userProfile, accessToken, refreshToken, expiresIn: '15m' },
    };
};
exports.registerUserService = registerUserService;
const registerPrivilegedUserService = async (data, roleName, requestingUserId) => {
    if (roleName === 'USER') {
        throw new Error('Use registerUserService for users');
    }
    const requestingUser = await user_model_1.User.findById(requestingUserId).populate('roleId');
    if (!requestingUser)
        throw new error_middleware_1.AuthenticationError('Requesting user not found');
    const requestingRoleName = requestingUser.roleId?.name;
    if (roleName === 'ADMIN' && requestingRoleName !== 'ADMIN') {
        throw new error_middleware_1.AuthenticationError('Only admins can create admin accounts');
    }
    if (roleName === 'STAFF' && requestingRoleName !== 'ADMIN') {
        throw new error_middleware_1.AuthenticationError('Only admins can create staff accounts');
    }
    const { name, email, password } = data;
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser)
        throw new error_middleware_1.ConflictError('A user with this email already exists');
    const hashed = await (0, hash_1.hashPassword)(password);
    const targetRole = await role_model_1.Role.findOne({ name: roleName, isActive: true });
    if (!targetRole)
        throw new Error(`Role ${roleName} not found`);
    const user = await user_model_1.User.create({
        name,
        email,
        password: hashed,
        roleId: targetRole._id,
        isVerified: true,
    });
    const userId = user._id.toString();
    const userProfile = {
        id: userId,
        name: user.name,
        email: user.email,
        role: roleName,
        roleId: targetRole._id.toString(),
        permissions: await (0, permission_service_1.getPermissionsAsStrings)(userId),
        phone: user.phone,
        address: user.address,
        profileUrl: user.profileUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
    const roleLabel = roleName === 'ADMIN' ? 'Admin' : 'Staff';
    return {
        success: true,
        message: `${roleLabel} registered successfully.`,
        data: { user: userProfile },
    };
};
exports.registerPrivilegedUserService = registerPrivilegedUserService;
const registerAdmin = async (data, requestingUserId) => (0, exports.registerPrivilegedUserService)(data, 'ADMIN', requestingUserId);
exports.registerAdmin = registerAdmin;
const registerStaff = async (data, requestingUserId) => (0, exports.registerPrivilegedUserService)(data, 'STAFF', requestingUserId);
exports.registerStaff = registerStaff;
const registerUser = async (data) => (0, exports.registerUserService)(data);
exports.registerUser = registerUser;
const login = async (userId) => {
    const user = await user_model_1.User.findByIdAndUpdate(userId, { lastLogin: new Date() }, { new: true }).populate('roleId');
    if (!user)
        throw new error_middleware_1.AuthenticationError('User not found');
    const roleName = user.roleId?.name ?? 'USER';
    const uid = user._id.toString();
    const token = (0, jwt_1.generateToken)({ id: uid, name: user.name, email: user.email, role: roleName });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: uid, name: user.name, email: user.email, role: roleName });
    await session_model_1.Session.findOneAndUpdate({ userId: user._id }, {
        refreshToken,
        revokedAt: undefined,
        revoked: false,
        expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
    }, { upsert: true, new: true });
    return {
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: uid,
                name: user.name,
                email: user.email,
                role: roleName,
                roleId: user.roleId?._id?.toString() ?? '',
                permissions: await (0, permission_service_1.getPermissionsAsStrings)(uid),
                phone: user.phone,
                address: user.address,
                profileUrl: user.profileUrl,
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
exports.login = login;
const verifyUserEmail = async (userId, code) => {
    const record = await email_verification_model_1.EmailVerification.findOne({ userId, code });
    if (!record)
        throw new error_middleware_1.AuthenticationError('Invalid verification code');
    if (record.expiresAt < new Date())
        throw new error_middleware_1.AuthenticationError('Verification code expired');
    const user = await user_model_1.User.findByIdAndUpdate(userId, { isVerified: true, verifiedAt: new Date() }, { new: true }).populate('roleId');
    if (!user)
        throw new error_middleware_1.AuthenticationError('User not found');
    await email_verification_model_1.EmailVerification.findByIdAndDelete(record._id);
    const roleName = user.roleId?.name ?? 'USER';
    const uid = user._id.toString();
    const token = (0, jwt_1.generateToken)({ id: uid, name: user.name, email: user.email, role: roleName });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: uid, name: user.name, email: user.email, role: roleName });
    await session_model_1.Session.findOneAndUpdate({ userId: user._id }, {
        refreshToken,
        revokedAt: undefined,
        revoked: false,
        expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
    }, { upsert: true, new: true });
    return {
        success: true,
        message: 'Email verified successfully',
        data: {
            user: {
                id: uid,
                name: user.name,
                email: user.email,
                role: roleName,
                roleId: user.roleId?._id?.toString() ?? '',
                permissions: await (0, permission_service_1.getPermissionsAsStrings)(uid),
                phone: user.phone,
                address: user.address,
                profileUrl: user.profileUrl,
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
exports.verifyUserEmail = verifyUserEmail;
const requestVerificationCode = async (userId, email) => {
    const code = (0, verification_code_generator_1.generateVerificationCode)();
    const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000);
    await email_verification_model_1.EmailVerification.findOneAndUpdate({ userId }, { userId, code, expiresAt, createdAt: new Date() }, { upsert: true, new: true });
    const expiryTime = (0, helper_1.getRelativeExpiry)(expiresAt);
    await (0, email_service_1.sendEmail)({ to: email, subject: 'Your Kodoo Verification Code', text: 'verification code', code, expiresAt: expiryTime });
};
exports.requestVerificationCode = requestVerificationCode;
const requestPasswordReset = async (userId, email) => {
    const resetToken = (0, token_generator_1.generateResetToken)(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await password_reset_token_model_1.PasswordResetToken.findOneAndUpdate({ userId }, { userId, resetToken, expiresAt }, { upsert: true, new: true });
    const expiryTime = (0, helper_1.getRelativeExpiry)(expiresAt);
    await (0, email_service_1.sendEmail)({ to: email, subject: 'Reset Your Password', text: 'reset token', code: resetToken, expiresAt: expiryTime });
};
exports.requestPasswordReset = requestPasswordReset;
const validateResetToken = async (token) => {
    const record = await password_reset_token_model_1.PasswordResetToken.findOne({ resetToken: token, expiresAt: { $gt: new Date() } });
    if (!record)
        throw new Error('Invalid reset token');
    return !!record.resetToken;
};
exports.validateResetToken = validateResetToken;
const resetPassword = async (userId, newPassword) => {
    const storedToken = await password_reset_token_model_1.PasswordResetToken.findOne({ userId });
    if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new Error('Invalid or expired reset token');
    }
    const hashed = await (0, hash_1.hashPassword)(newPassword);
    await user_model_1.User.findByIdAndUpdate(userId, { password: hashed, passwordUpdatedAt: new Date() });
    await password_reset_token_model_1.PasswordResetToken.findOneAndDelete({ userId });
};
exports.resetPassword = resetPassword;
const changePassword = async (userId, newPassword) => {
    const hashed = await (0, hash_1.hashPassword)(newPassword);
    await user_model_1.User.findByIdAndUpdate(userId, { password: hashed, passwordUpdatedAt: new Date() });
};
exports.changePassword = changePassword;
const userExists = async (email) => {
    const user = await user_model_1.User.findOne({ email });
    return !!user;
};
exports.userExists = userExists;
const findOneByEmail = async (email) => {
    return user_model_1.User.findOne({ email }).populate('roleId');
};
exports.findOneByEmail = findOneByEmail;
const findOneById = async (userId) => {
    return user_model_1.User.findById(userId).populate('roleId');
};
exports.findOneById = findOneById;
const logoutService = async (userId) => {
    const session = await session_model_1.Session.findOne({ userId });
    if (!session)
        throw new Error('Session not found');
    const now = new Date();
    if (session.expiresAt <= now) {
        await session_model_1.Session.findOneAndUpdate({ userId }, { revokedAt: now, revoked: true });
        throw new Error('Token already expired');
    }
    await session_model_1.Session.findOneAndUpdate({ userId }, { revokedAt: now, revoked: true });
};
exports.logoutService = logoutService;
const softDeleteUser = async (userId, deletionReason = 'USER_REQUESTED') => {
    const timestamp = Date.now();
    const anonymizedEmail = `deleted_${timestamp}_${userId.slice(-6)}@deleted.com`;
    return user_model_1.User.findByIdAndUpdate(userId, { deletedAt: new Date(), email: anonymizedEmail, isActive: false, deletionReason }, { new: true, select: 'id email isActive deletedAt deletionReason' });
};
exports.softDeleteUser = softDeleteUser;
const restoreUser = async (userId) => {
    return user_model_1.User.findByIdAndUpdate(userId, { deletedAt: null, isActive: true, deletionReason: null }, { new: true, select: 'id email isActive deletedAt deletionReason' });
};
exports.restoreUser = restoreUser;
