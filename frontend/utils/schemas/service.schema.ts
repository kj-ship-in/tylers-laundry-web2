import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(1, 'Service title is required'),
  type: z.string().min(1, 'Service type is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than zero'),
  features: z
    .array(z.object({ value: z.string() }))
    .min(1, 'At least one feature is required'),
  turnaround: z.string().optional(),
  includes: z
    .array(z.object({ value: z.string() }))
    .min(1, 'At least one item in includes is required'),
  ideal: z.array(z.object({ value: z.string() })).optional(),
  estimatedTime: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = z.object({
  title: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  features: z.array(z.object({ value: z.string() })).optional(),
  turnaround: z.string().optional(),
  includes: z.array(z.object({ value: z.string() })).optional(),
  ideal: z.array(z.object({ value: z.string() })).optional(),
  estimatedTime: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const serviceFormSchema = z.object({
  title: z.string().min(1, 'Service title is required'),
  type: z.string().min(1, 'Service type is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than zero'),
  features: z
    .array(z.object({ value: z.string() }))
    .min(1, 'At least one feature is required'),
  turnaround: z.string().optional(),
  includes: z
    .array(z.object({ value: z.string() }))
    .min(1, 'At least one item in includes is required'),
  ideal: z.array(z.object({ value: z.string() })).optional(),
  estimatedTime: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
