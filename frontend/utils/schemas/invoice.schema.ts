import { z } from 'zod';

export const createInvoiceSchema = z.object({
  paymentId: z.string().min(1, 'Payment is required'),
  totalAmount: z.string().min(1, 'Total amount is required'),
  tax: z.string().optional(),
  discount: z.string().optional(),
  issuedAt: z.string().min(1, 'Issued date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['UNPAID', 'PAID', 'CANCELLED', 'OVERDUE']).optional(),
});

export const updateInvoiceSchema = z.object({
  tax: z.string().optional(),
  discount: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['UNPAID', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
});

export const invoiceSchema = z.object({
  invoiceId: z.number().int().positive(),
});

// Form types
export type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceFormValues = z.infer<typeof updateInvoiceSchema>;
