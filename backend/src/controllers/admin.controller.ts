import { Request, Response, NextFunction } from 'express';

import {
  getDashboardDataService,
  getBookingReportsService,
  deleteStaffService,
  updateUserStatusService,
  deleteCustomerService,
} from '../services/admin.service';
import { Permission } from '../types/enums';

export const getDashboardDataController = async (
  _: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const data = await getDashboardDataService();
    return res.status(200).json({ message: 'Dashboard data fetched', data });
  } catch (error) {
    next(error);
  }
};

export const getBookingReportsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "'from' and 'to' query parameters are required" });
    }

    const data = await getBookingReportsService(
      new Date(from as string),
      new Date(to as string),
    );
    return res.status(200).json({ message: 'Booking report fetched', data });
  } catch (error) {
    next(error);
  }
};

export const deleteStaffController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const staffId = req.params.id;

    const deletedStaff = await deleteStaffService(staffId);

    return res.status(200).json({
      message: 'Staff deleted successfully',
      data: deletedStaff,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const updatedUser = await updateUserStatusService(userId, isActive);

    return res.status(200).json({
      message: `User status updated to ${isActive ? 'active' : 'inactive'} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const customerId = req.params.id;

    const deletedCustomer = await deleteCustomerService(customerId);

    return res.status(200).json({
      message: 'Customer deleted successfully',
      data: deletedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPermissionsController = async (
  _: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const permissions = Object.values(Permission);
    return res.status(200).json({
      message: 'All permissions retrieved successfully',
      data: permissions,
      total: permissions.length,
    });
  } catch (error) {
    next(error);
  }
};
