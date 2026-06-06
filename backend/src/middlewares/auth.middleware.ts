/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import { UserType } from '../types/enums';
import { verifyToken } from '../utils/jwt';
import logger from '../utils/logger';

import { AuthenticationError, AuthorizationError } from './error.middleware';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('Authorization token missing or malformed');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Token is required');
    }

    const payload = verifyToken(token) as JwtPayload;

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
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired. Please login again.'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token. Authentication failed.'));
    } else if (error instanceof AuthenticationError) {
      next(error);
    } else {
      logger.error('Auth middleware error:', error);
      next(new AuthenticationError('Authentication failed'));
    }
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (req.user.role !== UserType.ADMIN) {
    return next(new AuthorizationError('Admin access required'));
  }

  next();
};

export const requireStaffOrAdmin = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (req.user.role !== UserType.ADMIN && req.user.role !== UserType.STAFF) {
    return next(new AuthorizationError('Staff or Admin access required'));
  }

  next();
};

export const requireStaff = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (req.user.role !== UserType.STAFF) {
    return next(new AuthorizationError('Staff access required'));
  }

  next();
};

export const requireAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }
  next();
};
