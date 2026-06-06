import { z } from 'zod';

export const CreateTestimonialSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(1000, 'Content must be at most 1000 characters'),
});

export const UpdateTestimonialSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters')
    .optional(),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(1000, 'Content must be at most 1000 characters')
    .optional(),
});

export const GetTestimonialsQuerySchema = z.object({
  page: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, 'Page must be greater than 0')
    .optional(),
  limit: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional(),
  rating: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 1 && val <= 5, 'Rating must be between 1 and 5')
    .optional(),
  isApproved: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

export const TestimonialIdSchema = z.object({
  id: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, 'Invalid testimonial ID'),
});
