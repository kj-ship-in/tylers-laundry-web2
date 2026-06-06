"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableBiometricsSchema = exports.ChangePinSchema = exports.CreatePinSchema = exports.ResetPasswordSchema = exports.ChangePasswordSchema = void 0;
const zod_1 = require("zod");
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z
        .string()
        .min(8, 'Current password is required and must be at least 8 characters'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters'),
});
exports.ResetPasswordSchema = zod_1.z.object({
    resetToken: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters'),
});
exports.CreatePinSchema = zod_1.z.object({
    pin: zod_1.z
        .string()
        .length(6, 'PIN must be exactly 6 digits')
        .regex(/^\d{6}$/, 'PIN must contain only digits'),
});
exports.ChangePinSchema = zod_1.z.object({
    oldPin: zod_1.z
        .string()
        .length(6, 'Old PIN must be exactly 6 digits')
        .regex(/^\d{6}$/, 'Old PIN must contain only digits'),
    newPin: zod_1.z
        .string()
        .length(6, 'New PIN must be exactly 6 digits')
        .regex(/^\d{6}$/, 'New PIN must contain only digits'),
});
exports.EnableBiometricsSchema = zod_1.z.object({
    enable: zod_1.z.boolean(),
});
