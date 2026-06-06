import prisma from '../lib/prisma';
import { BookingStatus, PaymentStatus } from '../prisma/generated/prisma';
export const getDashboardStats = async () => {
    try {
        // Total Revenue (from paid payments)
        const revenueResult = await prisma.payment.aggregate({
            where: { status: PaymentStatus.PAID },
            _sum: { amount: true },
        });
        const totalRevenue = revenueResult._sum.amount ?? 0;
        // Active Bookings (PENDING or IN_PROGRESS)
        const activeBookings = await prisma.booking.count({
            where: {
                status: {
                    in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS],
                },
            },
        });
        // Total Customers (users with bookings)
        const totalCustomers = await prisma.user.count({
            where: {
                bookings: {
                    some: {},
                },
            },
        });
        // Pending Payments (payments not yet paid)
        const pendingPayments = await prisma.payment.count({
            where: { status: PaymentStatus.PENDING },
        });
        return {
            totalRevenue: Number(totalRevenue),
            activeBookings,
            totalCustomers,
            pendingPayments,
        };
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error('Failed to fetch dashboard statistics');
    }
};
export const getRecentBookings = async (limit = 5) => {
    try {
        return await prisma.booking.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                service: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        price: true,
                    },
                },
                payments: {
                    select: {
                        status: true,
                        amount: true,
                        currency: true,
                    },
                },
            },
        });
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
        // New bookings today
        const newBookingsToday = await prisma.booking.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        // Completed bookings today
        const completedToday = await prisma.booking.count({
            where: {
                status: BookingStatus.COMPLETED,
                updatedAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        // In progress bookings today
        const inProgressToday = await prisma.booking.count({
            where: {
                status: BookingStatus.IN_PROGRESS,
                updatedAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        // Revenue today
        const revenueTodayResult = await prisma.payment.aggregate({
            where: {
                status: PaymentStatus.PAID,
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            _sum: { amount: true },
        });
        const revenueToday = revenueTodayResult._sum.amount ?? 0;
        return {
            newBookings: newBookingsToday,
            completedBookings: completedToday,
            inProgressBookings: inProgressToday,
            revenueToday: Number(revenueToday),
        };
    }
    catch (error) {
        console.error('Error fetching daily overview:', error);
        throw new Error('Failed to fetch daily overview');
    }
};
