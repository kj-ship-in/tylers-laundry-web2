import prisma from '../lib/prisma';
import { PaymentStatus } from '../prisma/generated/prisma';
export const getDashboardDataService = async () => {
    const totalUsers = await prisma.user.count();
    const totalStaff = await prisma.user.count({
        where: { role: { name: 'STAFF' } },
    });
    const totalCustomers = await prisma.user.count({
        where: { role: { name: 'USER' } },
    });
    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({
        where: { status: 'PENDING' },
    });
    const completedBookings = await prisma.booking.count({
        where: { status: 'COMPLETED' },
    });
    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.PAID },
    });
    const recentBookings = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: true, service: true, payments: true },
    });
    return {
        users: { totalUsers, totalStaff, totalCustomers },
        bookings: {
            totalBookings,
            pendingBookings,
            completedBookings,
            recentBookings,
        },
        revenue: totalRevenue._sum.amount ?? 0,
    };
};
export const getBookingReportsService = async (from, to) => {
    const bookings = await prisma.booking.findMany({
        where: {
            date: { gte: from, lte: to },
        },
        include: { user: true, service: true, payments: true },
    });
    const revenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    return { bookings, revenue };
};
export const deleteStaffService = async (staffId) => {
    const staff = await prisma.user.findUnique({
        where: { id: staffId },
        include: { role: true },
    });
    if (!staff) {
        throw new Error('Staff not found');
    }
    if (staff.role.name !== 'STAFF') {
        throw new Error('User is not a staff member');
    }
    // Soft delete the staff
    const timestamp = Date.now();
    const anonymizedEmail = `deleted_staff_${timestamp}_${staffId.toString().slice(-6)}@deleted.com`;
    const result = await prisma.user.update({
        where: { id: staffId },
        data: {
            deletedAt: new Date(),
            email: anonymizedEmail,
            isActive: false,
            deletionReason: 'ADMIN_DELETED',
        },
        select: {
            id: true,
            email: true,
            isActive: true,
            deletedAt: true,
            deletionReason: true,
        },
    });
    return result;
};
export const updateUserStatusService = async (userId, isActive) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const result = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
        },
    });
    return result;
};
export const deleteCustomerService = async (customerId) => {
    const customer = await prisma.user.findUnique({
        where: { id: customerId },
        include: { role: true },
    });
    if (!customer) {
        throw new Error('Customer not found');
    }
    if (customer.role.name !== 'USER') {
        throw new Error('User is not a customer');
    }
    // Soft delete the customer
    const timestamp = Date.now();
    const anonymizedEmail = `deleted_customer_${timestamp}_${customerId.toString().slice(-6)}@deleted.com`;
    const result = await prisma.user.update({
        where: { id: customerId },
        data: {
            deletedAt: new Date(),
            email: anonymizedEmail,
            isActive: false,
            deletionReason: 'ADMIN_DELETED',
        },
        select: {
            id: true,
            email: true,
            isActive: true,
            deletedAt: true,
            deletionReason: true,
        },
    });
    return result;
};
