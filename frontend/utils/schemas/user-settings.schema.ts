import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .transform(val => {
      // Capitalize each word and clean spacing
      return val
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    })
    .refine(
      val => val.split(' ').length >= 2,
      'Please enter both first and last name',
    )
    .refine(
      val => /^[A-Za-z\s'-]+$/.test(val),
      'Name can only contain letters, spaces, hyphens, and apostrophes',
    ),

  email: z.string().email('Please enter a valid email address'),

  phone: z
    .string()
    .optional()
    .refine(
      val =>
        !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-\(\)]/g, '')),
      'Please enter a valid phone number',
    ),

  address: z
    .string()
    .optional()
    .refine(
      val => !val || val.length >= 5,
      'Address must be at least 5 characters if provided',
    ),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),

    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),

    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const deleteCustomerSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),

  deletionReason: z.string().max(255, 'Reason is too long').optional(),
});

export type DeleteCustomerFormValues = z.infer<typeof deleteCustomerSchema>;
