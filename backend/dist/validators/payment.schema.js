import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '../types/enums';
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
export const createPaymentSchema = z.object({
    bookingId: z.string().regex(mongoIdRegex, 'Invalid booking ID'),
    amount: z.coerce.number().positive(),
    currency: z.string().min(1, 'Currency is required'),
    method: z.nativeEnum(PaymentMethod),
    status: z.nativeEnum(PaymentStatus).optional(),
    gatewayResponse: z.string().optional(),
});
export const updatePaymentSchema = z.object({
    status: z.nativeEnum(PaymentStatus).optional(),
    gatewayResponse: z.string().optional(),
});
export const updatePaymentStatusSchema = z.object({
    status: z.nativeEnum(PaymentStatus),
});
