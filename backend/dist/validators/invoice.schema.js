"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceSchema = exports.updateInvoiceSchema = exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
exports.createInvoiceSchema = zod_1.z.object({
    paymentId: zod_1.z.string().regex(mongoIdRegex, 'Invalid payment ID'),
    totalAmount: zod_1.z.number().positive(),
    tax: zod_1.z.number().nonnegative(),
    discount: zod_1.z.number().nonnegative(),
    issuedAt: zod_1.z.string(),
    dueDate: zod_1.z.string(),
    status: zod_1.z.nativeEnum(enums_1.InvoiceStatus).optional(),
});
exports.updateInvoiceSchema = zod_1.z.object({
    tax: zod_1.z.coerce.number().optional(),
    discount: zod_1.z.coerce.number().optional(),
    dueDate: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(enums_1.InvoiceStatus).optional(),
});
exports.invoiceSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().regex(mongoIdRegex, 'Invalid invoice ID'),
});
