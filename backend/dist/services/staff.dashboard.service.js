"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffDailyOverview = exports.getStaffRecentBookings = exports.getStaffDashboardStats = void 0;
/* eslint-disable no-console */
const booking_model_1 = require("../models/booking.model");
const payment_model_1 = require("../models/payment.model");
const enums_1 = require("../types/enums");
const getStaffDashboardStats = async () => {
    try {
        const [revenueResult, activeBookings, pendingPayments] = await Promise.all([
            payment_model_1.Payment.aggregate([
                { $match: { status: enums_1.PaymentStatus.PAID } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            booking_model_1.Booking.countDocuments({ status: { $in: [enums_1.BookingStatus.PENDING, enums_1.BookingStatus.IN_PROGRESS] } }),
            payment_model_1.Payment.countDocuments({ status: enums_1.PaymentStatus.PENDING }),
        ]);
        const totalRevenue = revenueResult[0]?.total ?? 0;
        const usersWithBookings = await booking_model_1.Booking.distinct('userId', { userId: { $exists: true } });
        const totalCustomers = usersWithBookings.length;
        return { totalRevenue: Number(totalRevenue), activeBookings, totalCustomers, pendingPayments };
    }
    catch (error) {
        console.error('Error fetching staff dashboard stats:', error);
        throw new Error('Failed to fetch staff dashboard statistics');
    }
};
exports.getStaffDashboardStats = getStaffDashboardStats;
const getStaffRecentBookings = async (limit = 5) => {
    try {
        return booking_model_1.Booking.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({ path: 'userId', select: 'id name email phone' })
            .populate({ path: 'serviceId', select: 'id title type price' })
            .populate({ path: 'payments', select: 'status amount currency' });
    }
    catch (error) {
        console.error('Error fetching staff recent bookings:', error);
        throw new Error('Failed to fetch staff recent bookings');
    }
};
exports.getStaffRecentBookings = getStaffRecentBookings;
const getStaffDailyOverview = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [newBookingsToday, completedToday, inProgressToday, revenueTodayResult] = await Promise.all([
            booking_model_1.Booking.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            booking_model_1.Booking.countDocuments({
                status: enums_1.BookingStatus.COMPLETED,
                updatedAt: { $gte: today, $lt: tomorrow },
            }),
            booking_model_1.Booking.countDocuments({
                status: enums_1.BookingStatus.IN_PROGRESS,
                updatedAt: { $gte: today, $lt: tomorrow },
            }),
            payment_model_1.Payment.aggregate([
                { $match: { status: enums_1.PaymentStatus.PAID, createdAt: { $gte: today, $lt: tomorrow } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);
        return {
            newBookings: newBookingsToday,
            completedBookings: completedToday,
            inProgressBookings: inProgressToday,
            revenueToday: Number(revenueTodayResult[0]?.total ?? 0),
        };
    }
    catch (error) {
        console.error('Error fetching staff daily overview:', error);
        throw new Error('Failed to fetch staff daily overview');
    }
};
exports.getStaffDailyOverview = getStaffDailyOverview;
