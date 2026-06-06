import { z } from 'zod';
export const ChangePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(8, 'Current password is required and must be at least 8 characters'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});
export const ResetPasswordSchema = z.object({
    resetToken: z.string(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});
export const CreatePinSchema = z.object({
    pin: z
        .string()
        .length(6, 'PIN must be exactly 6 digits')
        .regex(/^\d{6}$/, 'PIN must contain only digits'),
});
export const ChangePinSchema = z.object({
    oldPin: z
        .string()
        .length(6, 'Old PIN must be exactly 6 digits')
        .regex(/^\d{6}$/, 'Old PIN must contain only digits'),
    newPin: z
        .string()
        .length(6, 'New PIN must be exactly 6 digits')
        .regex(/^\d{6}$/, 'New PIN must contain only digits'),
});
export const EnableBiometricsSchema = z.object({
    enable: z.boolean(),
});
