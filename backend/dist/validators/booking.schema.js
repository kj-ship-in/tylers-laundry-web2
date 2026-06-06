import { z } from 'zod';
export const createBookingSchema = z.object({
    userId: z.number().int(),
    serviceId: z.number().int(),
    pickupAddress: z.string().min(1, 'Pickup address is required'),
    deliveryAddress: z.string().min(1, 'Delivery address is required'),
    date: z.coerce.date(),
    pickupTime: z.string().min(1, 'Pickup time is required'),
    totalAmount: z.coerce.number().positive(),
    deliveryFee: z.coerce.number().nonnegative().optional(), // Auto-calculated from deliveryAddress in backend
    note: z.string().optional(),
});
export const updateBookingSchema = z.object({
    pickupAddress: z.string().optional(),
    deliveryAddress: z.string().optional(),
    date: z.coerce.date().optional(),
    pickupTime: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
    totalAmount: z.coerce.number().optional(),
    deliveryFee: z.coerce.number().optional(),
    note: z.string().optional(),
});
