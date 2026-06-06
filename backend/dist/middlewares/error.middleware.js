"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class ValidationError extends Error {
    statusCode = 400;
    isOperational = true;
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends Error {
    statusCode = 401;
    isOperational = true;
    constructor(message = 'Authentication required') {
        super(message);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends Error {
    statusCode = 403;
    isOperational = true;
    constructor(message = 'Access denied') {
        super(message);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends Error {
    statusCode = 404;
    isOperational = true;
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends Error {
    statusCode = 409;
    isOperational = true;
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
const errorHandler = (err, req, res, _next) => {
    let { statusCode = 500, message = 'Internal Server Error' } = err;
    const errorDetails = {
        message: err.message,
        stack: err.stack,
        statusCode,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
    };
    if (statusCode >= 500) {
        logger_1.default.error('Server Error:', errorDetails);
    }
    else {
        logger_1.default.warn('Client Error:', errorDetails);
    }
    if (err.name === 'ValidationError' || err.name === 'ZodError') {
        statusCode = 400;
        message = 'Validation Error';
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (err.name === 'PrismaClientKnownRequestError') {
        if (err.code === 'P2002') {
            statusCode = 409;
            message = 'Duplicate entry';
        }
        else if (err.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found';
        }
    }
    const response = {
        success: false,
        message,
        statusCode,
    };
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.details = err;
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    logger_1.default.warn(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        statusCode: 404,
    });
};
exports.notFoundHandler = notFoundHandler;
