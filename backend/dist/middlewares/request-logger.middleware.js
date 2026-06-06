"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const requestLogger = (req, res, next) => {
    const start = Date.now();
    logger_1.default.http(`${req.method} ${req.url} - ${req.ip}`);
    const originalSend = res.send;
    res.send = function (body) {
        const duration = Date.now() - start;
        const size = Buffer.byteLength(body ?? '', 'utf8');
        logger_1.default.http(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${size} bytes`);
        return originalSend.call(this, body);
    };
    next();
};
exports.requestLogger = requestLogger;
