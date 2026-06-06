"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatusController = exports.deleteBookingController = exports.updateBookingController = exports.getBookingByIdController = exports.getBookingsByUserIdController = exports.getAllBookingsController = exports.adminCreateBookingController = exports.schedulePickupController = exports.createBookingController = void 0;
const bookingService = __importStar(require("../services/booking.service"));
const serviceService = __importStar(require("../services/service.service"));
const booking_schema_1 = require("../validators/booking.schema");
const createBookingController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const parsedRequest = booking_schema_1.createBookingSchema.safeParse({
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
exports.createBookingController = createBookingController;
const schedulePickupController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const parsedRequest = booking_schema_1.schedulePickupSchema.safeParse(req.body);
        if (!parsedRequest.success) {
            return res.status(400).json({
                message: parsedRequest.error,
            });
        }
        // For scheduling pickup, we might need to calculate totalAmount based on service
        // For now, assume it's provided or set a default
        const service = await serviceService.getServiceById(parsedRequest.data.serviceId);
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
    }
    catch (error) {
        next(error);
    }
};
exports.schedulePickupController = schedulePickupController;
const adminCreateBookingController = async (req, res, next) => {
    try {
        const parsedRequest = booking_schema_1.adminCreateBookingSchema.safeParse(req.body);
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
    }
    catch (error) {
        next(error);
    }
};
exports.adminCreateBookingController = adminCreateBookingController;
const getAllBookingsController = async (_, res, next) => {
    try {
        const bookings = await bookingService.getAllBookings();
        res.status(200).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllBookingsController = getAllBookingsController;
const getBookingsByUserIdController = async (req, res, next) => {
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
exports.getBookingsByUserIdController = getBookingsByUserIdController;
const getBookingByIdController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const booking = await bookingService.getBookingById(id);
        if (!booking)
            return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json({ booking });
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingByIdController = getBookingByIdController;
const updateBookingController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const parsedRequest = booking_schema_1.createBookingSchema.safeParse(req.body);
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
exports.updateBookingController = updateBookingController;
const deleteBookingController = async (req, res, next) => {
    try {
        const id = req.params.id;
        await bookingService.deleteBooking(id);
        res.json({ message: 'Booking deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBookingController = deleteBookingController;
const updateBookingStatusController = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateBookingStatusController = updateBookingStatusController;
