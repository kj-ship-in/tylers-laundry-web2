"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const zod_1 = require("zod");
const logger_1 = __importDefault(require("../utils/logger"));
const error_middleware_1 = require("./error.middleware");
function validateBody(schema) {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                logger_1.default.warn('Validation failed:', {
                    url: req.url,
                    method: req.method,
                    errors: errorMessages,
                });
                next(new error_middleware_1.ValidationError(`Validation failed: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`));
            }
            else {
                next(error);
            }
        }
    };
}
function validateQuery(schema) {
    return (req, _res, next) => {
        try {
            schema.parse({ ...req.query });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                logger_1.default.warn('Query validation failed:', {
                    url: req.url,
                    method: req.method,
                    errors: errorMessages,
                });
                next(new error_middleware_1.ValidationError(`Query validation failed: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`));
            }
            else {
                next(error);
            }
        }
    };
}
function validateParams(schema) {
    return (req, _res, next) => {
        try {
            const parsedParams = schema.parse(req.params);
            req.params = parsedParams;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                logger_1.default.warn('Params validation failed:', {
                    url: req.url,
                    method: req.method,
                    errors: errorMessages,
                });
                next(new error_middleware_1.ValidationError(`Parameters validation failed: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`));
            }
            else {
                next(error);
            }
        }
    };
}
