"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyOverviewController = exports.getRecentBookingsController = exports.getDashboardStatsController = void 0;
const admin_dashboard_service_1 = require("../services/admin.dashboard.service");
const getDashboardStatsController = async (_req, res, next) => {
    try {
        const stats = await (0, admin_dashboard_service_1.getDashboardStats)();
        return res.status(200).json({
            data: stats,
            message: 'Dashboard statistics retrieved successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStatsController = getDashboardStatsController;
const getRecentBookingsController = async (req, res, next) => {
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
        const bookings = await (0, admin_dashboard_service_1.getRecentBookings)(limit);
        return res.status(200).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
exports.getRecentBookingsController = getRecentBookingsController;
const getDailyOverviewController = async (_, res, next) => {
    try {
        const overview = await (0, admin_dashboard_service_1.getDailyOverview)();
        return res.status(200).json(overview);
    }
    catch (error) {
        next(error);
    }
};
exports.getDailyOverviewController = getDailyOverviewController;
