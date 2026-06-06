import { z } from 'zod';

export const createReceiptSchema = z.object({
  invoiceId: z.string().min(1, 'Booking is required'),
  issuedAt: z.string(),
  receivedBy: z.string().optional(),
  notes: z.string().optional(),
});

export const updateReceiptSchema = z.object({
  receivedBy: z.string().optional(),
  notes: z.string().optional(),
});

export const receiptSchema = z.object({
  receiptId: z.number().int().positive(),
});

// Form value types
export type CreateReceiptFormValues = z.infer<typeof createReceiptSchema>;
export type UpdateReceiptFormValues = z.infer<typeof updateReceiptSchema>;
