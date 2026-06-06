import logger from '../utils/logger';
export class ValidationError extends Error {
    statusCode = 400;
    isOperational = true;
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
export class AuthenticationError extends Error {
    statusCode = 401;
    isOperational = true;
    constructor(message = 'Authentication required') {
        super(message);
        this.name = 'AuthenticationError';
    }
}
export class AuthorizationError extends Error {
    statusCode = 403;
    isOperational = true;
    constructor(message = 'Access denied') {
        super(message);
        this.name = 'AuthorizationError';
    }
}
export class NotFoundError extends Error {
    statusCode = 404;
    isOperational = true;
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}
export class ConflictError extends Error {
    statusCode = 409;
    isOperational = true;
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
    }
}
export const errorHandler = (err, req, res, _next) => {
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
        logger.error('Server Error:', errorDetails);
    }
    else {
        logger.warn('Client Error:', errorDetails);
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
export const notFoundHandler = (req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        statusCode: 404,
    });
};
