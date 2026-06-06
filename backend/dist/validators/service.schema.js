"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceSchema = exports.createServiceSchema = void 0;
const zod_1 = require("zod");
exports.createServiceSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Service title is required'),
    type: zod_1.z.string().min(1, 'Service type is required'),
    description: zod_1.z.string().optional(),
    price: zod_1.z.coerce.number().positive('Price must be greater than zero'),
    features: zod_1.z.array(zod_1.z.string()).min(1, 'At least one feature is required'),
    turnaround: zod_1.z.string().optional(),
    includes: zod_1.z
        .array(zod_1.z.string())
        .min(1, 'At least one item in includes is required'),
    ideal: zod_1.z.string().optional(),
    estimatedTime: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateServiceSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.coerce.number().positive().optional(),
    features: zod_1.z.array(zod_1.z.string()).optional(),
    turnaround: zod_1.z.string().optional(),
    includes: zod_1.z.array(zod_1.z.string()).optional(),
    ideal: zod_1.z.string().optional(),
    estimatedTime: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
