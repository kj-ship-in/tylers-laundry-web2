import { z } from 'zod';
export const createPaymentSchema = z.object({
    bookingId: z.number().int(),
    amount: z.coerce.number().positive(),
    currency: z.string().min(1, 'Currency is required'),
    method: z.enum(['CASH', 'BANK', 'WAVE', 'APS', 'YONNA']),
    status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    gatewayResponse: z.string().optional(),
});
export const updatePaymentSchema = z.object({
    status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    gatewayResponse: z.string().optional(),
});
export const updatePaymentStatusSchema = z.object({
    status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
});
