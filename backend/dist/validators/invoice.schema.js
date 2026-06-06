import { z } from 'zod';
import { InvoiceStatus } from '../types/enums';
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
export const createInvoiceSchema = z.object({
    paymentId: z.string().regex(mongoIdRegex, 'Invalid payment ID'),
    totalAmount: z.number().positive(),
    tax: z.number().nonnegative(),
    discount: z.number().nonnegative(),
    issuedAt: z.string(),
    dueDate: z.string(),
    status: z.nativeEnum(InvoiceStatus).optional(),
});
export const updateInvoiceSchema = z.object({
    tax: z.coerce.number().optional(),
    discount: z.coerce.number().optional(),
    dueDate: z.string().optional(),
    status: z.nativeEnum(InvoiceStatus).optional(),
});
export const invoiceSchema = z.object({
    invoiceId: z.string().regex(mongoIdRegex, 'Invalid invoice ID'),
});
