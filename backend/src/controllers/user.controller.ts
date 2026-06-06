import { Request, Response, NextFunction } from 'express';

import {
  getCustomersService,
  getStaffsService,
  getCurrentUserService,
  getUserStatsService,
  updateProfileDetailsService,
  updateProfilePictureService,
  updateUserRoleService,
} from '../services/user.service';
import { ApiResponse } from '../types/express';
import logger from '../utils/logger';
import { UpdateProfileDetailsSchema } from '../validators/user.schema';

export const getCurrentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new Error('Unauthorized'));
    }

    const user = await getCurrentUserService(userId);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfileDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new Error('Unauthorized'));
    }
    const data = UpdateProfileDetailsSchema.parse(req.body);

    const updatedUser = await updateProfileDetailsService(userId, data);

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateProfilePictureController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new Error('Unauthorized'));
    }

    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        message: 'No image file provided',
      };
      res.status(400).json(response);
      return;
    }

    const profileUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await updateProfilePictureService(userId, profileUrl);

    const response: ApiResponse = {
      success: true,
      message: 'Profile picture updated successfully',
      data: updatedUser,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getCustomersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) ?? 1;
    const limit = parseInt(req.query.limit as string) ?? 10;
    const search = req.query.search as string;
    const includeDeleted = req.query.includeDeleted === 'true';

    if (limit > 100) {
      const response: ApiResponse = {
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

    const response: ApiResponse = {
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
  } catch (error) {
    logger.error('Error in getCustomersController:', error);
    next(error);
  }
};

export const getStaffsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) ?? 1;
    const limit = parseInt(req.query.limit as string) ?? 10;
    const search = req.query.search as string;
    const includeDeleted = req.query.includeDeleted === 'true';

    if (limit > 100) {
      const response: ApiResponse = {
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

    const response: ApiResponse = {
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
  } catch (error) {
    logger.error('Error in getStaffsController:', error);
    next(error);
  }
};

export const updateUserRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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

    const updatedUser = await updateUserRoleService(userId, role);

    res.status(200).json({
      message: `User role updated to ${role} successfully`,
      data: updatedUser,
    });
  } catch (error: unknown) {
    logger.error('Error in updateUserTypeController:', error);

    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (
      error instanceof Error &&
      error.message.includes('already has the role')
    ) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
};

export const getUserStatsController = async (
  _: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await getUserStatsService();

    res.status(200).json({
      message: 'User statistics retrieved successfully',
      data: stats,
    });
  } catch (error: unknown) {
    logger.error('Error in getUserStatsController:', error);
    next(error);
  }
};
