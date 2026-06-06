"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateResetToken = (length = 6) => {
    const digits = '0123456789';
    const bytes = crypto_1.default.randomBytes(length);
    let token = '';
    for (let i = 0; i < length; i++) {
        token += digits[bytes[i] % digits.length];
    }
    return token;
};
exports.generateResetToken = generateResetToken;
