import { z } from 'zod';
export const RegisterUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});
export const VerifyEmailSchema = z.object({
    email: z.email('Invalid email address'),
    code: z.string().length(6, 'Verification code must be 6 digits'),
});
export const LoginUserSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
export const RequestVerificationSchema = z.object({
    email: z.email('Invalid email address'),
});
export const RequestPasswordResetSchema = z.object({
    email: z.email('Invalid email address'),
});
export const PasswordResetSchema = z.object({
    email: z.email('Invalid email address'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});
export const ChangePasswordSchema = z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z
        .string()
        .min(6, 'New password must be at least 8 characters long'),
});
export const RefreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});
export const ResetTokenSchema = z.object({
    resetToken: z.string().min(1, 'Reset token is required'),
});
export const SoftDeleteUserSchema = z.object({
    deletionReason: z.string().optional(),
    currentPassword: z.string().min(1, 'Password is required'),
});
export const CreateStaffSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    phone: z.string().min(1, 'Phone is required'),
    address: z.string().min(1, 'Address is required'),
});
