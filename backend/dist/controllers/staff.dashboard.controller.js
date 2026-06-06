"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffDailyOverviewController = exports.getStaffRecentBookingsController = exports.getStaffDashboardStatsController = void 0;
const staff_dashboard_service_1 = require("../services/staff.dashboard.service");
const getStaffDashboardStatsController = async (_req, res, next) => {
    try {
        const stats = await (0, staff_dashboard_service_1.getStaffDashboardStats)();
        return res.status(200).json({
            data: stats,
            message: 'Staff dashboard statistics retrieved successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStaffDashboardStatsController = getStaffDashboardStatsController;
const getStaffRecentBookingsController = async (req, res, next) => {
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
        const bookings = await (0, staff_dashboard_service_1.getStaffRecentBookings)(limit);
        return res.status(200).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
exports.getStaffRecentBookingsController = getStaffRecentBookingsController;
const getStaffDailyOverviewController = async (_, res, next) => {
    try {
        const overview = await (0, staff_dashboard_service_1.getStaffDailyOverview)();
        return res.status(200).json(overview);
    }
    catch (error) {
        next(error);
    }
};
exports.getStaffDailyOverviewController = getStaffDailyOverviewController;
