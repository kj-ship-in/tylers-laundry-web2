import { NextFunction, Request, Response } from 'express';

import {
  getStaffDashboardStats,
  getStaffRecentBookings,
  getStaffDailyOverview,
} from '../services/staff.dashboard.service';

export const getStaffDashboardStatsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const stats = await getStaffDashboardStats();
    return res.status(200).json({
      data: stats,
      message: 'Staff dashboard statistics retrieved successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffRecentBookingsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new Error('Unauthorized'));
    }

    const limit = req.query.limit ? Number(req.query.limit) : 5;

    if (isNaN(limit) || limit < 1 || limit > 12) {
      return res.status(400).json({
        message: 'Invalid limit. Must be a number between 1 and 12.',
      });
    }

    const bookings = await getStaffRecentBookings(limit);
    return res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getStaffDailyOverviewController = async (
  _: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const overview = await getStaffDailyOverview();
    return res.status(200).json(overview);
  } catch (error) {
    next(error);
  }
};
