import { z } from 'zod';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const createReceiptSchema = z.object({
  invoiceId: z.string().regex(mongoIdRegex, 'Invalid invoice ID'),
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
  receiptId: z.string().regex(mongoIdRegex, 'Invalid receipt ID'),
});
