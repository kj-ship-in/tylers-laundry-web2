import { z } from 'zod';

export const createPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking is required'),
  amount: z.string().min(1, 'Amount is required'),
  currency: z.string().min(1, 'Currency is required'),
  method: z.enum(['CASH', 'WAVE', 'APS', 'BANK', 'YONNA']),
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  gatewayResponse: z.string().optional(),
});

export type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>;

export const updatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  gatewayResponse: z.string().optional(),
});

export const paymentSchema = z.object({
  paymentId: z.number().int().positive(),
});
