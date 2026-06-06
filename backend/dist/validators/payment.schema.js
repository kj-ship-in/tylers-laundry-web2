"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusSchema = exports.updatePaymentSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../types/enums");
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
exports.createPaymentSchema = zod_1.z.object({
    bookingId: zod_1.z.string().regex(mongoIdRegex, 'Invalid booking ID'),
    amount: zod_1.z.coerce.number().positive(),
    currency: zod_1.z.string().min(1, 'Currency is required'),
    method: zod_1.z.nativeEnum(enums_1.PaymentMethod),
    status: zod_1.z.nativeEnum(enums_1.PaymentStatus).optional(),
    gatewayResponse: zod_1.z.string().optional(),
});
exports.updatePaymentSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enums_1.PaymentStatus).optional(),
    gatewayResponse: zod_1.z.string().optional(),
});
exports.updatePaymentStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enums_1.PaymentStatus),
});
