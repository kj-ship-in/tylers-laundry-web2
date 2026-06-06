"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptSchema = exports.updateReceiptSchema = exports.createReceiptSchema = void 0;
const zod_1 = require("zod");
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
exports.createReceiptSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().regex(mongoIdRegex, 'Invalid invoice ID'),
    receiptNo: zod_1.z.string().optional(),
    issuedAt: zod_1.z.string(),
    receivedBy: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.updateReceiptSchema = zod_1.z.object({
    receivedBy: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.receiptSchema = zod_1.z.object({
    receiptId: zod_1.z.string().regex(mongoIdRegex, 'Invalid receipt ID'),
});
