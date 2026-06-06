/* eslint-disable no-console */
import { Booking } from '../models/booking.model';
import { Payment } from '../models/payment.model';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { BookingStatus, PaymentStatus } from '../types/enums';
export const getDashboardStats = async () => {
    try {
        const [revenueResult, activeBookings, pendingPayments] = await Promise.all([
            Payment.aggregate([
                { $match: { status: PaymentStatus.PAID } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Booking.countDocuments({ status: { $in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS] } }),
            Payment.countDocuments({ status: PaymentStatus.PENDING }),
        ]);
        const totalRevenue = revenueResult[0]?.total ?? 0;
        const usersWithBookings = await Booking.distinct('userId');
        const totalCustomers = usersWithBookings.length;
        return { totalRevenue: Number(totalRevenue), activeBookings, totalCustomers, pendingPayments };
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error('Failed to fetch dashboard statistics');
    }
};
export const getRecentBookings = async (limit = 5) => {
    try {
        return Booking.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({ path: 'userId', select: 'id name email phone' })
            .populate({ path: 'serviceId', select: 'id title type price' })
            .populate({ path: 'payments', select: 'status amount currency' });
    }
    catch (error) {
        console.error('Error fetching recent bookings:', error);
        throw new Error('Failed to fetch recent bookings');
    }
};
export const getDailyOverview = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [newBookingsToday, completedToday, inProgressToday, revenueTodayResult] = await Promise.all([
            Booking.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Booking.countDocuments({
                status: BookingStatus.COMPLETED,
                updatedAt: { $gte: today, $lt: tomorrow },
            }),
            Booking.countDocuments({
                status: BookingStatus.IN_PROGRESS,
                updatedAt: { $gte: today, $lt: tomorrow },
            }),
            Payment.aggregate([
                { $match: { status: PaymentStatus.PAID, createdAt: { $gte: today, $lt: tomorrow } } },
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
        console.error('Error fetching daily overview:', error);
        throw new Error('Failed to fetch daily overview');
    }
};
// suppress unused import
void Role;
void User;
