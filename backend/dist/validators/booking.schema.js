"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingSchema = exports.adminCreateBookingSchema = exports.schedulePickupSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    serviceId: zod_1.z.string().min(1, 'Service ID is required'),
    pickupAddress: zod_1.z.string().min(1, 'Pickup address is required'),
    deliveryAddress: zod_1.z.string().optional(),
    date: zod_1.z.coerce.date(),
    pickupTime: zod_1.z.string().min(1, 'Pickup time is required'),
    totalAmount: zod_1.z.coerce.number().positive(),
    deliveryFee: zod_1.z.coerce.number().nonnegative().optional(), // Auto-calculated from deliveryAddress in backend
    note: zod_1.z.string().optional(),
});
exports.schedulePickupSchema = zod_1.z.object({
    serviceId: zod_1.z.string().min(1, 'Service ID is required'),
    pickupAddress: zod_1.z.string().min(1, 'Pickup address is required'),
    deliveryAddress: zod_1.z.string().optional(),
    date: zod_1.z.coerce.date(),
    pickupTime: zod_1.z.string().min(1, 'Pickup time is required'),
    note: zod_1.z.string().optional(),
});
exports.adminCreateBookingSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    serviceId: zod_1.z.string().min(1, 'Service ID is required'),
    pickupAddress: zod_1.z.string().min(1, 'Pickup address is required'),
    deliveryAddress: zod_1.z.string().optional(),
    date: zod_1.z.coerce.date(),
    pickupTime: zod_1.z.string().min(1, 'Pickup time is required'),
    totalAmount: zod_1.z.coerce.number().positive(),
    deliveryFee: zod_1.z.coerce.number().nonnegative().optional(),
    note: zod_1.z.string().optional(),
});
exports.updateBookingSchema = zod_1.z.object({
    pickupAddress: zod_1.z.string().optional(),
    deliveryAddress: zod_1.z.string().optional(),
    date: zod_1.z.coerce.date().optional(),
    pickupTime: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
    totalAmount: zod_1.z.coerce.number().optional(),
    deliveryFee: zod_1.z.coerce.number().optional(),
    note: zod_1.z.string().optional(),
});
