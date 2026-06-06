import { z } from 'zod';
export const createReceiptSchema = z.object({
    invoiceId: z.number().int(),
    receiptNo: z.string().optional(),
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
