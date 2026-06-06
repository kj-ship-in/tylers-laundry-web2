"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStatsController = exports.updateUserRoleController = exports.getStaffsController = exports.getCustomersController = exports.updateProfilePictureController = exports.updateProfileDetailsController = exports.getCurrentUserController = void 0;
const user_service_1 = require("../services/user.service");
const logger_1 = __importDefault(require("../utils/logger"));
const user_schema_1 = require("../validators/user.schema");
const getCurrentUserController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new Error('Unauthorized'));
        }
        const user = await (0, user_service_1.getCurrentUserService)(userId);
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrentUserController = getCurrentUserController;
const updateProfileDetailsController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new Error('Unauthorized'));
        }
        const data = user_schema_1.UpdateProfileDetailsSchema.parse(req.body);
        const updatedUser = await (0, user_service_1.updateProfileDetailsService)(userId, data);
        const response = {
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfileDetailsController = updateProfileDetailsController;
const updateProfilePictureController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new Error('Unauthorized'));
        }
        if (!req.file) {
            const response = {
                success: false,
                message: 'No image file provided',
            };
            res.status(400).json(response);
            return;
        }
        const profileUrl = `/uploads/${req.file.filename}`;
        const updatedUser = await (0, user_service_1.updateProfilePictureService)(userId, profileUrl);
        const response = {
            success: true,
            message: 'Profile picture updated successfully',
            data: updatedUser,
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfilePictureController = updateProfilePictureController;
const getCustomersController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) ?? 1;
        const limit = parseInt(req.query.limit) ?? 10;
        const search = req.query.search;
        const includeDeleted = req.query.includeDeleted === 'true';
        if (limit > 100) {
            const response = {
                success: false,
                message: 'Limit cannot exceed 100 users per page',
            };
            res.status(400).json(response);
            return;
        }
        const result = await (0, user_service_1.getCustomersService)({
            page,
            limit,
            search,
            includeDeleted,
        });
        const response = {
            success: true,
            message: 'Customers retrieved successfully',
            data: result.users,
            pagination: {
                page: result.pagination.currentPage,
                limit,
                total: result.pagination.totalUsers,
                totalPages: result.pagination.totalPages,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error('Error in getCustomersController:', error);
        next(error);
    }
};
exports.getCustomersController = getCustomersController;
const getStaffsController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) ?? 1;
        const limit = parseInt(req.query.limit) ?? 10;
        const search = req.query.search;
        const includeDeleted = req.query.includeDeleted === 'true';
        if (limit > 100) {
            const response = {
                success: false,
                message: 'Limit cannot exceed 100 users per page',
            };
            res.status(400).json(response);
            return;
        }
        const result = await (0, user_service_1.getStaffsService)({
            page,
            limit,
            search,
            includeDeleted,
        });
        const response = {
            success: true,
            message: 'Staffs retrieved successfully',
            data: result.users,
            pagination: {
                page: result.pagination.currentPage,
                limit,
                total: result.pagination.totalUsers,
                totalPages: result.pagination.totalPages,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.default.error('Error in getStaffsController:', error);
        next(error);
    }
};
exports.getStaffsController = getStaffsController;
const updateUserRoleController = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;
        if (!role) {
            res.status(400).json({ message: 'Role is required' });
            return;
        }
        const validRoles = ['USER', 'ADMIN', 'STAFF'];
        if (!validRoles.includes(role)) {
            res.status(400).json({
                message: 'Invalid role. Must be USER, ADMIN, or STAFF',
            });
            return;
        }
        if (req.user?.id === userId) {
            res.status(400).json({
                message: 'You cannot change your own role',
            });
            return;
        }
        const updatedUser = await (0, user_service_1.updateUserRoleService)(userId, role);
        res.status(200).json({
            message: `User role updated to ${role} successfully`,
            data: updatedUser,
        });
    }
    catch (error) {
        logger_1.default.error('Error in updateUserTypeController:', error);
        if (error instanceof Error && error.message === 'User not found') {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (error instanceof Error &&
            error.message.includes('already has the role')) {
            res.status(400).json({ message: error.message });
            return;
        }
        next(error);
    }
};
exports.updateUserRoleController = updateUserRoleController;
const getUserStatsController = async (_, res, next) => {
    try {
        const stats = await (0, user_service_1.getUserStatsService)();
        res.status(200).json({
            message: 'User statistics retrieved successfully',
            data: stats,
        });
    }
    catch (error) {
        logger_1.default.error('Error in getUserStatsController:', error);
        next(error);
    }
};
exports.getUserStatsController = getUserStatsController;
