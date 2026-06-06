import jwt from 'jsonwebtoken';

import { env } from '../config/env';

import logger from './logger';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  type?: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateToken = (payload: Omit<JwtPayload, 'type'>): string => {
  try {
    return jwt.sign({ ...payload, type: 'access' }, env.JWT_SECRET, {
      expiresIn: '15m',
      issuer: 'tylers-laundry-api',
      audience: 'tylers-laundry-app',
    });
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
};

export const generateRefreshToken = (
  payload: Omit<JwtPayload, 'type'>,
): string => {
  try {
    const refreshSecret = env.JWT_REFRESH_SECRET ?? env.JWT_SECRET;
    return jwt.sign({ ...payload, type: 'refresh' }, refreshSecret, {
      expiresIn: '7d',
      issuer: 'tylers-laundry-api',
      audience: 'tylers-laundry-app',
    });
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

export const generateTokenPair = (
  payload: Omit<JwtPayload, 'type'>,
): TokenPair => {
  return {
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'tylers-laundry-api',
      audience: 'tylers-laundry-app',
    }) as JwtPayload;

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token:', (error as Error).message);
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.info('JWT token expired');
    } else {
      logger.error('JWT verification error:', error);
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const refreshSecret = env.JWT_REFRESH_SECRET ?? env.JWT_SECRET;
    const decoded = jwt.verify(token, refreshSecret, {
      issuer: 'tylers-laundry-api',
      audience: 'tylers-laundry-app',
    }) as JwtPayload;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid refresh token:', (error as Error).message);
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.info('Refresh token expired');
    } else {
      logger.error('Refresh token verification error:', error);
    }
    throw error;
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
};

export const getTokenExpiry = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as any;
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    logger.error('Error getting token expiry:', error);
    return null;
  }
};
