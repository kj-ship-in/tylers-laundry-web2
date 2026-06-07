import { z } from 'zod';

const createAccountFormSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long')
      .transform(val => {
        // Capitalize each word and clean spacing
        return val
          .trim()
          .split(/\s+/)
          .map(
            word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
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

    email: z.email().min(2, {
      message: 'email must be at least 2 characters.',
    }),

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

    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter.',
      })
      .regex(/[0-9]/, {
        message: 'Password must contain at least one number.',
      }),

    confirmPassword: z.string().min(1, {
      message: 'Please confirm your password.',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type CreateAccountFormValues = z.infer<typeof createAccountFormSchema>;

export default createAccountFormSchema;
