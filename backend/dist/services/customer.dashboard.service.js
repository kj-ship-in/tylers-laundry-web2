import prisma from '../lib/prisma';
import { BookingStatus, PaymentStatus } from '../prisma/generated/prisma';
export const getCustomerDashboardStats = async (userId) => {
    try {
        // Total Bookings for the user
        const totalBookings = await prisma.booking.count({
            where: { userId },
        });
        // Total Spent (from paid payments)
        const totalSpentResult = await prisma.payment.aggregate({
            where: {
                booking: { userId },
                status: PaymentStatus.PAID,
            },
            _sum: { amount: true },
        });
        const totalSpent = totalSpentResult._sum.amount ?? 0;
        // Pending Payments
        const pendingPayments = await prisma.payment.count({
            where: {
                booking: { userId },
                status: PaymentStatus.PENDING,
            },
        });
        // Active Bookings (PENDING or IN_PROGRESS)
        const activeBookings = await prisma.booking.count({
            where: {
                userId,
                status: {
                    in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS],
                },
            },
        });
        return {
            totalBookings,
            totalSpent: Number(totalSpent),
            pendingPayments,
            activeBookings,
        };
    }
    catch (error) {
        console.error('Error fetching customer dashboard stats:', error);
        throw new Error('Failed to fetch customer dashboard statistics');
    }
};
export const getCustomerRecentBookings = async (userId, limit = 5) => {
    try {
        return await prisma.booking.findMany({
            where: { userId },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                        address: true,
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
        console.error('Error fetching customer recent bookings:', error);
        throw new Error('Failed to fetch recent bookings');
    }
};
export const getCustomerUpcomingBookings = async (userId, limit = 5) => {
    try {
        const now = new Date();
        return await prisma.booking.findMany({
            where: {
                userId,
                date: {
                    gte: now,
                },
                status: {
                    in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS],
                },
            },
            take: limit,
            orderBy: { date: 'asc' },
            include: {
                service: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        price: true,
                    },
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching customer upcoming bookings:', error);
        throw new Error('Failed to fetch upcoming bookings');
    }
};
