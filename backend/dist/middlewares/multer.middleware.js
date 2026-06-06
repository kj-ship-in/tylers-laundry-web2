"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads/');
    },
    filename: (_, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `profile-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (_, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG and PNG are allowed'));
        }
        cb(null, true);
    },
});
