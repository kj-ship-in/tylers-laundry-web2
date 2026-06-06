import { getCustomerDashboardStats, getCustomerRecentBookings, getCustomerUpcomingBookings, } from '../services/customer.dashboard.service';
export const getCustomerDashboardStatsController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new Error('Unauthorized'));
        }
        const stats = await getCustomerDashboardStats(userId);
        return res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
};
export const getCustomerRecentBookingsController = async (req, res, next) => {
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
        const bookings = await getCustomerRecentBookings(userId, limit);
        return res.status(200).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
export const getCustomerUpcomingBookingsController = async (req, res, next) => {
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
        const bookings = await getCustomerUpcomingBookings(userId, limit);
        return res.status(200).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
