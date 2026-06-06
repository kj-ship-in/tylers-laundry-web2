import { z } from 'zod';
export const createInvoiceSchema = z.object({
    paymentId: z.number().int(),
    totalAmount: z.number().positive(),
    tax: z.number().nonnegative(),
    discount: z.number().nonnegative(),
    issuedAt: z.string(),
    dueDate: z.string(),
    status: z.enum(['UNPAID', 'PAID', 'CANCELLED', 'OVERDUE']).optional(),
});
export const updateInvoiceSchema = z.object({
    tax: z.coerce.number().optional(),
    discount: z.coerce.number().optional(),
    dueDate: z.string().optional(),
    status: z.enum(['UNPAID', 'PAID', 'OVERDUE']).optional(),
});
export const invoiceSchema = z.object({
    invoiceId: z.number().int().positive(),
});
