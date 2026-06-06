"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenExpiry = exports.decodeToken = exports.verifyRefreshToken = exports.verifyToken = exports.generateTokenPair = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const logger_1 = __importDefault(require("./logger"));
const generateToken = (payload) => {
    try {
        return jsonwebtoken_1.default.sign({ ...payload, type: 'access' }, env_1.env.JWT_SECRET, {
            expiresIn: '15m',
            issuer: 'tylers-laundry-api',
            audience: 'tylers-laundry-app',
        });
    }
    catch (error) {
        logger_1.default.error('Error generating access token:', error);
        throw new Error('Failed to generate access token');
    }
};
exports.generateToken = generateToken;
const generateRefreshToken = (payload) => {
    try {
        const refreshSecret = env_1.env.JWT_REFRESH_SECRET ?? env_1.env.JWT_SECRET;
        return jsonwebtoken_1.default.sign({ ...payload, type: 'refresh' }, refreshSecret, {
            expiresIn: '7d',
            issuer: 'tylers-laundry-api',
            audience: 'tylers-laundry-app',
        });
    }
    catch (error) {
        logger_1.default.error('Error generating refresh token:', error);
        throw new Error('Failed to generate refresh token');
    }
};
exports.generateRefreshToken = generateRefreshToken;
const generateTokenPair = (payload) => {
    return {
        accessToken: (0, exports.generateToken)(payload),
        refreshToken: (0, exports.generateRefreshToken)(payload),
    };
};
exports.generateTokenPair = generateTokenPair;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET, {
            issuer: 'tylers-laundry-api',
            audience: 'tylers-laundry-app',
        });
        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.default.warn('Invalid JWT token:', error.message);
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            logger_1.default.info('JWT token expired');
        }
        else {
            logger_1.default.error('JWT verification error:', error);
        }
        throw error;
    }
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    try {
        const refreshSecret = env_1.env.JWT_REFRESH_SECRET ?? env_1.env.JWT_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, refreshSecret, {
            issuer: 'tylers-laundry-api',
            audience: 'tylers-laundry-app',
        });
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.default.warn('Invalid refresh token:', error.message);
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            logger_1.default.info('Refresh token expired');
        }
        else {
            logger_1.default.error('Refresh token verification error:', error);
        }
        throw error;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const decodeToken = (token) => {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch (error) {
        logger_1.default.error('Error decoding token:', error);
        return null;
    }
};
exports.decodeToken = decodeToken;
const getTokenExpiry = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (decoded?.exp) {
            return new Date(decoded.exp * 1000);
        }
        return null;
    }
    catch (error) {
        logger_1.default.error('Error getting token expiry:', error);
        return null;
    }
};
exports.getTokenExpiry = getTokenExpiry;
