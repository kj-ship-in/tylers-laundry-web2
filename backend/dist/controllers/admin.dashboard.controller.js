import { getDashboardStats, getRecentBookings, getDailyOverview, } from '../services/admin.dashboard.service';
export const getDashboardStatsController = async (_req, res, next) => {
    try {
        const stats = await getDashboardStats();
        return res.status(200).json({
            data: stats,
            message: 'Dashboard statistics retrieved successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
export const getRecentBookingsController = async (req, res, next) => {
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
        const bookings = await getRecentBookings(limit);
        return res.status(200).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
export const getDailyOverviewController = async (_, res, next) => {
    try {
        const overview = await getDailyOverview();
        return res.status(200).json(overview);
    }
    catch (error) {
        next(error);
    }
};
