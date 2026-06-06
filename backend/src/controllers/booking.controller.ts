import { Request, Response, NextFunction } from 'express';

import * as bookingService from '../services/booking.service';
import * as serviceService from '../services/service.service';
import {
  createBookingSchema,
  schedulePickupSchema,
  adminCreateBookingSchema,
} from '../validators/booking.schema';

export const createBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const parsedRequest = createBookingSchema.safeParse({
      ...req.body,
      userId,
    });

    if (!parsedRequest.success) {
      return res.status(400).json({
        message: parsedRequest.error,
      });
    }
    const booking = await bookingService.createBooking(parsedRequest.data);
    res
      .status(201)
      .json({ data: booking, message: 'Booking created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const schedulePickupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const parsedRequest = schedulePickupSchema.safeParse(req.body);

    if (!parsedRequest.success) {
      return res.status(400).json({
        message: parsedRequest.error,
      });
    }

    // For scheduling pickup, we might need to calculate totalAmount based on service
    // For now, assume it's provided or set a default
    const service = await serviceService.getServiceById(
      parsedRequest.data.serviceId,
    );
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const bookingData = {
      ...parsedRequest.data,
      userId,
      totalAmount: service.price, // Assuming price is the amount
      deliveryFee: parsedRequest.data.deliveryAddress ? 5.0 : 0, // Example fee
    };

    const booking = await bookingService.createBooking(bookingData);
    res
      .status(201)
      .json({ data: booking, message: 'Pickup scheduled successfully.' });
  } catch (error) {
    next(error);
  }
};

export const adminCreateBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const parsedRequest = adminCreateBookingSchema.safeParse(req.body);

    if (!parsedRequest.success) {
      return res.status(400).json({
        message: parsedRequest.error,
      });
    }

    const booking = await bookingService.createBooking(parsedRequest.data);
    res.status(201).json({
      data: booking,
      message: 'Booking created for client successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookingsController = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingsByUserIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found' });
    }
    const bookings = await bookingService.getBookingsByUserId(userId);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const id = req.params.id;
    const booking = await bookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ booking });
  } catch (error) {
    next(error);
  }
};

export const updateBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const id = req.params.id;

    const parsedRequest = createBookingSchema.safeParse(req.body);

    if (!parsedRequest.success) {
      return res.status(400).json({
        message: parsedRequest.error,
      });
    }
    const updated = await bookingService.updateBooking(id, parsedRequest.data);
    res
      .status(200)
      .json({ data: updated, message: 'Booking updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    await bookingService.deleteBooking(id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Status field is required in request body.',
      });
    }

    const validStatuses = [
      'PENDING',
      'IN_PROGRESS',
      'COMPLETED',
      'DELIVERED',
      'CANCELLED',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status "${status}". Valid statuses are: ${validStatuses.join(', ')}`,
      });
    }

    const booking = await bookingService.updateBookingStatus(id, status);
    res.status(200).json({
      data: booking,
      message: `Booking successfully changed to "${status.toString()}".`,
    });
  } catch (error) {
    next(error);
  }
};
