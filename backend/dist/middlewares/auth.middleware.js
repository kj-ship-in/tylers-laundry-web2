"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.requireStaff = exports.requireStaffOrAdmin = exports.requireAdmin = exports.authMiddleware = void 0;
const enums_1 = require("../types/enums");
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../utils/logger"));
const error_middleware_1 = require("./error.middleware");
const authMiddleware = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new error_middleware_1.AuthenticationError('Authorization token missing or malformed');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new error_middleware_1.AuthenticationError('Token is required');
        }
        const payload = (0, jwt_1.verifyToken)(token);
        if (!payload.id || !payload.email || !payload.role) {
            throw new error_middleware_1.AuthenticationError('Invalid token payload');
        }
        req.user = {
            id: payload.id,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            iat: payload.iat,
            exp: payload.exp,
        };
        logger_1.default.debug(`User authenticated: ${payload.email} (${payload.role})`);
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            next(new error_middleware_1.AuthenticationError('Token expired. Please login again.'));
        }
        else if (error.name === 'JsonWebTokenError') {
            next(new error_middleware_1.AuthenticationError('Invalid token. Authentication failed.'));
        }
        else if (error instanceof error_middleware_1.AuthenticationError) {
            next(error);
        }
        else {
            logger_1.default.error('Auth middleware error:', error);
            next(new error_middleware_1.AuthenticationError('Authentication failed'));
        }
    }
};
exports.authMiddleware = authMiddleware;
const requireAdmin = (req, _res, next) => {
    if (!req.user) {
        return next(new error_middleware_1.AuthenticationError('Authentication required'));
    }
    if (req.user.role !== enums_1.UserType.ADMIN) {
        return next(new error_middleware_1.AuthorizationError('Admin access required'));
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireStaffOrAdmin = (req, _res, next) => {
    if (!req.user) {
        return next(new error_middleware_1.AuthenticationError('Authentication required'));
    }
    if (req.user.role !== enums_1.UserType.ADMIN && req.user.role !== enums_1.UserType.STAFF) {
        return next(new error_middleware_1.AuthorizationError('Staff or Admin access required'));
    }
    next();
};
exports.requireStaffOrAdmin = requireStaffOrAdmin;
const requireStaff = (req, _res, next) => {
    if (!req.user) {
        return next(new error_middleware_1.AuthenticationError('Authentication required'));
    }
    if (req.user.role !== enums_1.UserType.STAFF) {
        return next(new error_middleware_1.AuthorizationError('Staff access required'));
    }
    next();
};
exports.requireStaff = requireStaff;
const requireAuth = (req, _res, next) => {
    if (!req.user) {
        return next(new error_middleware_1.AuthenticationError('Authentication required'));
    }
    next();
};
exports.requireAuth = requireAuth;
