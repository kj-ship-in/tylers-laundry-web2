"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwnershipOrAdmin = exports.requireAnyPermission = exports.requirePermission = void 0;
const enums_1 = require("../types/enums");
const permission_service_1 = require("../services/permission.service");
/**
 * Middleware to check if user has required permission
 */
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const userHasRequiredPermission = await (0, permission_service_1.userHasPermission)(user.id, permission);
            if (!userHasRequiredPermission) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    required: permission.toLowerCase().replace(/_/g, ':'),
                });
                return;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requirePermission = requirePermission;
/**
 * Middleware to check if user has any of the required permissions
 */
const requireAnyPermission = (permissions) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            const hasAnyPermission = await (0, permission_service_1.userHasAnyPermission)(user.id, permissions);
            if (!hasAnyPermission) {
                res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    required: permissions.map(p => p.toLowerCase().replace(/_/g, ':')),
                });
                return;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireAnyPermission = requireAnyPermission;
/**
 * Middleware to check if user owns the resource or has admin permissions
 */
const requireOwnershipOrAdmin = (getResourceUserId, adminPermission = enums_1.Permission.STAFF_MANAGE) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }
            // Check if user is admin
            const isAdmin = await (0, permission_service_1.userHasPermission)(user.id, adminPermission);
            if (isAdmin) {
                next();
                return;
            }
            // Check if user owns the resource
            const resourceUserId = getResourceUserId(req);
            if (resourceUserId && resourceUserId === user.id) {
                next();
                return;
            }
            res.status(403).json({
                success: false,
                message: 'Access denied: You can only access your own resources',
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
