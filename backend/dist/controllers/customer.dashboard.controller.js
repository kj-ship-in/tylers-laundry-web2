"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerUpcomingBookingsController = exports.getCustomerRecentBookingsController = exports.getCustomerDashboardStatsController = void 0;
const customer_dashboard_service_1 = require("../services/customer.dashboard.service");
const getCustomerDashboardStatsController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new Error('Unauthorized'));
        }
        const stats = await (0, customer_dashboard_service_1.getCustomerDashboardStats)(userId);
        return res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerDashboardStatsController = getCustomerDashboardStatsController;
const getCustomerRecentBookingsController = async (req, res, next) => {
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
        const bookings = await (0, customer_dashboard_service_1.getCustomerRecentBookings)(userId, limit);
        return res.status(200).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerRecentBookingsController = getCustomerRecentBookingsController;
const getCustomerUpcomingBookingsController = async (req, res, next) => {
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
        const bookings = await (0, customer_dashboard_service_1.getCustomerUpcomingBookings)(userId, limit);
        return res.status(200).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerUpcomingBookingsController = getCustomerUpcomingBookingsController;
