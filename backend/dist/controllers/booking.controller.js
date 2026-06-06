import * as bookingService from '../services/booking.service';
import { createBookingSchema } from '../validators/booking.schema';
export const createBookingController = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const getAllBookingsController = async (_, res, next) => {
    try {
        const bookings = await bookingService.getAllBookings();
        res.status(200).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
export const getBookingsByUserIdController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: User ID not found' });
        }
        const bookings = await bookingService.getBookingsByUserId(userId);
        res.status(200).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
export const getBookingByIdController = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const booking = await bookingService.getBookingById(id);
        if (!booking)
            return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json({ booking });
    }
    catch (error) {
        next(error);
    }
};
export const updateBookingController = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
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
    }
    catch (error) {
        next(error);
    }
};
export const deleteBookingController = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await bookingService.deleteBooking(id);
        res.json({ message: 'Booking deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const updateBookingStatusController = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
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
    }
    catch (error) {
        next(error);
    }
};
