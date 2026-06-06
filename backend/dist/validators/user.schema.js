"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserIdSchema = exports.UpdateProfilePictureSchema = exports.UpdateProfileDetailsSchema = void 0;
const zod_1 = require("zod");
exports.UpdateProfileDetailsSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.email().optional(),
});
exports.UpdateProfilePictureSchema = zod_1.z.object({
    profileUrl: zod_1.z.string().url({ message: 'Must be a valid URL' }),
});
exports.UserIdSchema = zod_1.z.object({
    userId: zod_1.z.number().int().positive(),
});
