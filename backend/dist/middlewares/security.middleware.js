"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xssProtection = void 0;
const xssProtection = (req, _res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        // Sanitize query parameters in place
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                const value = req.query[key];
                req.query[key] = value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '');
            }
        });
    }
    next();
};
exports.xssProtection = xssProtection;
function sanitizeObject(obj) {
    if (typeof obj === 'string') {
        return obj
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }
    return obj;
}
