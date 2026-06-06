"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialIdSchema = exports.GetTestimonialsQuerySchema = exports.UpdateTestimonialSchema = exports.CreateTestimonialSchema = void 0;
const zod_1 = require("zod");
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
exports.CreateTestimonialSchema = zod_1.z.object({
    rating: zod_1.z
        .number()
        .int()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),
    title: zod_1.z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be at most 255 characters'),
    content: zod_1.z
        .string()
        .min(10, 'Content must be at least 10 characters')
        .max(1000, 'Content must be at most 1000 characters'),
});
exports.UpdateTestimonialSchema = zod_1.z.object({
    rating: zod_1.z
        .number()
        .int()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5')
        .optional(),
    title: zod_1.z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be at most 255 characters')
        .optional(),
    content: zod_1.z
        .string()
        .min(10, 'Content must be at least 10 characters')
        .max(1000, 'Content must be at most 1000 characters')
        .optional(),
});
exports.GetTestimonialsQuerySchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .transform(val => parseInt(val, 10))
        .refine(val => val > 0, 'Page must be greater than 0')
        .optional(),
    limit: zod_1.z
        .string()
        .transform(val => parseInt(val, 10))
        .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
        .optional(),
    rating: zod_1.z
        .string()
        .transform(val => parseInt(val, 10))
        .refine(val => val >= 1 && val <= 5, 'Rating must be between 1 and 5')
        .optional(),
    isApproved: zod_1.z
        .string()
        .transform(val => val === 'true')
        .optional(),
});
exports.TestimonialIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(mongoIdRegex, 'Invalid testimonial ID'),
});
