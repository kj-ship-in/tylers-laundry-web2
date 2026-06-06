"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerUpcomingBookings = exports.getCustomerRecentBookings = exports.getCustomerDashboardStats = void 0;
/* eslint-disable no-console */
const booking_model_1 = require("../models/booking.model");
const payment_model_1 = require("../models/payment.model");
const enums_1 = require("../types/enums");
const getCustomerDashboardStats = async (userId) => {
    try {
        const bookingIds = await booking_model_1.Booking.find({ userId }).distinct('_id');
        const [totalBookings, totalSpentResult, pendingPayments, activeBookings] = await Promise.all([
            booking_model_1.Booking.countDocuments({ userId }),
            payment_model_1.Payment.aggregate([
                { $match: { bookingId: { $in: bookingIds }, status: enums_1.PaymentStatus.PAID } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            payment_model_1.Payment.countDocuments({ bookingId: { $in: bookingIds }, status: enums_1.PaymentStatus.PENDING }),
            booking_model_1.Booking.countDocuments({
                userId,
                status: { $in: [enums_1.BookingStatus.PENDING, enums_1.BookingStatus.IN_PROGRESS] },
            }),
        ]);
        return {
            totalBookings,
            totalSpent: Number(totalSpentResult[0]?.total ?? 0),
            pendingPayments,
            activeBookings,
        };
    }
    catch (error) {
        console.error('Error fetching customer dashboard stats:', error);
        throw new Error('Failed to fetch customer dashboard statistics');
    }
};
exports.getCustomerDashboardStats = getCustomerDashboardStats;
const getCustomerRecentBookings = async (userId, limit = 5) => {
    try {
        return booking_model_1.Booking.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({ path: 'userId', select: 'name phone address' })
            .populate({ path: 'serviceId', select: 'id title type price' })
            .populate({ path: 'payments', select: 'status amount currency' });
    }
    catch (error) {
        console.error('Error fetching customer recent bookings:', error);
        throw new Error('Failed to fetch recent bookings');
    }
};
exports.getCustomerRecentBookings = getCustomerRecentBookings;
const getCustomerUpcomingBookings = async (userId, limit = 5) => {
    try {
        return booking_model_1.Booking.find({
            userId,
            date: { $gte: new Date() },
            status: { $in: [enums_1.BookingStatus.PENDING, enums_1.BookingStatus.IN_PROGRESS] },
        })
            .sort({ date: 1 })
            .limit(limit)
            .populate({ path: 'serviceId', select: 'id title type price' });
    }
    catch (error) {
        console.error('Error fetching customer upcoming bookings:', error);
        throw new Error('Failed to fetch upcoming bookings');
    }
};
exports.getCustomerUpcomingBookings = getCustomerUpcomingBookings;
