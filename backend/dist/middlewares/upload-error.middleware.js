"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = void 0;
const multer_1 = __importDefault(require("multer"));
const handleUploadError = (error, _req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                message: 'File too large. Maximum size allowed is 5MB.',
            });
            return;
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            res.status(400).json({
                message: 'Unexpected field name. Use "image" as the field name.',
            });
            return;
        }
        res.status(400).json({
            message: `Upload error: ${error.message}`,
        });
        return;
    }
    if (error.message === 'Only JPEG and PNG are allowed') {
        res.status(400).json({
            message: 'Invalid file type. Only JPEG and PNG images are allowed.',
        });
        return;
    }
    next(error);
};
exports.handleUploadError = handleUploadError;
