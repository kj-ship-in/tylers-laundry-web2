"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStaffSchema = exports.SoftDeleteUserSchema = exports.ResetTokenSchema = exports.RefreshTokenSchema = exports.ChangePasswordSchema = exports.PasswordResetSchema = exports.RequestPasswordResetSchema = exports.RequestVerificationSchema = exports.LoginUserSchema = exports.VerifyEmailSchema = exports.RegisterUserSchema = void 0;
const zod_1 = require("zod");
exports.RegisterUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
});
exports.VerifyEmailSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email address'),
    code: zod_1.z.string().length(6, 'Verification code must be 6 digits'),
});
exports.LoginUserSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.RequestVerificationSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email address'),
});
exports.RequestPasswordResetSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email address'),
});
exports.PasswordResetSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email address'),
    newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
});
exports.ChangePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, 'Old password is required'),
    newPassword: zod_1.z
        .string()
        .min(6, 'New password must be at least 8 characters long'),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.ResetTokenSchema = zod_1.z.object({
    resetToken: zod_1.z.string().min(1, 'Reset token is required'),
});
exports.SoftDeleteUserSchema = zod_1.z.object({
    deletionReason: zod_1.z.string().optional(),
    currentPassword: zod_1.z.string().min(1, 'Password is required'),
});
exports.CreateStaffSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    address: zod_1.z.string().min(1, 'Address is required'),
});
