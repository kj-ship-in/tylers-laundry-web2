/* eslint-disable no-console */
import { Booking } from '../models/booking.model';
import { Payment } from '../models/payment.model';
import { BookingStatus, PaymentStatus } from '../types/enums';

export const getCustomerDashboardStats = async (userId: string) => {
  try {
    const bookingIds = await Booking.find({ userId }).distinct('_id');

    const [totalBookings, totalSpentResult, pendingPayments, activeBookings] = await Promise.all([
      Booking.countDocuments({ userId }),
      Payment.aggregate([
        { $match: { bookingId: { $in: bookingIds }, status: PaymentStatus.PAID } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.countDocuments({ bookingId: { $in: bookingIds }, status: PaymentStatus.PENDING }),
      Booking.countDocuments({
        userId,
        status: { $in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS] },
      }),
    ]);

    return {
      totalBookings,
      totalSpent: Number(totalSpentResult[0]?.total ?? 0),
      pendingPayments,
      activeBookings,
    };
  } catch (error) {
    console.error('Error fetching customer dashboard stats:', error);
    throw new Error('Failed to fetch customer dashboard statistics');
  }
};

export const getCustomerRecentBookings = async (userId: string, limit: number = 5) => {
  try {
    return Booking.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: 'userId', select: 'name phone address' })
      .populate({ path: 'serviceId', select: 'id title type price' })
      .populate({ path: 'payments', select: 'status amount currency' });
  } catch (error) {
    console.error('Error fetching customer recent bookings:', error);
    throw new Error('Failed to fetch recent bookings');
  }
};

export const getCustomerUpcomingBookings = async (userId: string, limit: number = 5) => {
  try {
    return Booking.find({
      userId,
      date: { $gte: new Date() },
      status: { $in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS] },
    })
      .sort({ date: 1 })
      .limit(limit)
      .populate({ path: 'serviceId', select: 'id title type price' });
  } catch (error) {
    console.error('Error fetching customer upcoming bookings:', error);
    throw new Error('Failed to fetch upcoming bookings');
  }
};
