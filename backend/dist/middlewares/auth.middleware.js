import { UserType } from '../prisma/generated/prisma';
import { verifyToken } from '../utils/jwt';
import logger from '../utils/logger';
import { AuthenticationError, AuthorizationError } from './error.middleware';
export const authMiddleware = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AuthenticationError('Authorization token missing or malformed');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new AuthenticationError('Token is required');
        }
        const payload = verifyToken(token);
        if (!payload.id || !payload.email || !payload.role) {
            throw new AuthenticationError('Invalid token payload');
        }
        req.user = {
            id: payload.id,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            iat: payload.iat,
            exp: payload.exp,
        };
        logger.debug(`User authenticated: ${payload.email} (${payload.role})`);
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            next(new AuthenticationError('Token expired. Please login again.'));
        }
        else if (error.name === 'JsonWebTokenError') {
            next(new AuthenticationError('Invalid token. Authentication failed.'));
        }
        else if (error instanceof AuthenticationError) {
            next(error);
        }
        else {
            logger.error('Auth middleware error:', error);
            next(new AuthenticationError('Authentication failed'));
        }
    }
};
export const requireAdmin = (req, _res, next) => {
    if (!req.user) {
        return next(new AuthenticationError('Authentication required'));
    }
    if (req.user.role !== UserType.ADMIN) {
        return next(new AuthorizationError('Admin access required'));
    }
    next();
};
export const requireStaffOrAdmin = (req, _res, next) => {
    if (!req.user) {
        return next(new AuthenticationError('Authentication required'));
    }
    if (req.user.role !== UserType.ADMIN && req.user.role !== UserType.STAFF) {
        return next(new AuthorizationError('Staff or Admin access required'));
    }
    next();
};
export const requireStaff = (req, _res, next) => {
    if (!req.user) {
        return next(new AuthenticationError('Authentication required'));
    }
    if (req.user.role !== UserType.STAFF) {
        return next(new AuthorizationError('Staff access required'));
    }
    next();
};
export const requireAuth = (req, _res, next) => {
    if (!req.user) {
        return next(new AuthenticationError('Authentication required'));
    }
    next();
};
