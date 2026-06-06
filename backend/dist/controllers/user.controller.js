import { getCustomersService, getStaffsService, getCurrentUserService, getUserStatsService, updateProfileDetailsService, updateProfilePictureService, updateUserRoleService, } from '../services/user.service';
import logger from '../utils/logger';
import { UpdateProfileDetailsSchema } from '../validators/user.schema';
export const getCurrentUserController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new Error('Unauthorized'));
        }
        const user = await getCurrentUserService(userId);
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
export const updateProfileDetailsController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new Error('Unauthorized'));
        }
        const data = UpdateProfileDetailsSchema.parse(req.body);
        const updatedUser = await updateProfileDetailsService(userId, data);
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
export const updateProfilePictureController = async (req, res, next) => {
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
        const updatedUser = await updateProfilePictureService(userId, profileUrl);
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
export const getCustomersController = async (req, res, next) => {
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
        const result = await getCustomersService({
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
        logger.error('Error in getCustomersController:', error);
        next(error);
    }
};
export const getStaffsController = async (req, res, next) => {
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
        const result = await getStaffsService({
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
        logger.error('Error in getStaffsController:', error);
        next(error);
    }
};
export const updateUserRoleController = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id, 10);
        const { role } = req.body;
        if (isNaN(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
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
        const updatedUser = await updateUserRoleService(userId, role);
        res.status(200).json({
            message: `User role updated to ${role} successfully`,
            data: updatedUser,
        });
    }
    catch (error) {
        logger.error('Error in updateUserTypeController:', error);
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
export const getUserStatsController = async (_, res, next) => {
    try {
        const stats = await getUserStatsService();
        res.status(200).json({
            message: 'User statistics retrieved successfully',
            data: stats,
        });
    }
    catch (error) {
        logger.error('Error in getUserStatsController:', error);
        next(error);
    }
};
