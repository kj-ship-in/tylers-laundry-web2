import prisma from '../lib/prisma';
import { generateTransactionId } from '../utils/helper';
// Helper function to check if a booking is fully paid
export const isBookingFullyPaid = async (bookingId) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            payments: {
                where: { status: 'PAID' },
            },
        },
    });
    if (!booking) {
        throw new Error('Booking not found');
    }
    const totalPaid = booking.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    return totalPaid >= Number(booking.totalAmount);
};
// Helper function to update booking status based on payment status
export const syncBookingStatusWithPayments = async (bookingId) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            payments: true,
        },
    });
    if (!booking)
        return;
    const hasPaidPayments = booking.payments.some(p => p.status === 'PAID');
    const isFullyPaid = await isBookingFullyPaid(bookingId);
    const hasFailedPayments = booking.payments.some(p => p.status === 'FAILED');
    const hasRefundedPayments = booking.payments.some(p => p.status === 'REFUNDED');
    let newStatus = booking.status;
    if (isFullyPaid &&
        booking.status !== 'COMPLETED' &&
        booking.status !== 'DELIVERED') {
        newStatus = 'COMPLETED';
    }
    else if (hasRefundedPayments && !hasPaidPayments) {
        newStatus = 'CANCELLED';
    }
    else if (hasFailedPayments &&
        !hasPaidPayments &&
        booking.status === 'PENDING') {
        // Keep as pending or handle failed payments appropriately
        newStatus = 'PENDING';
    }
    if (newStatus !== booking.status) {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: newStatus },
        });
    }
};
export const createPayment = async (data) => {
    // Check if booking is already fully paid
    const isFullyPaid = await isBookingFullyPaid(data.bookingId);
    if (isFullyPaid) {
        throw new Error('Cannot create payment: Booking is already fully paid');
    }
    const transactionId = generateTransactionId();
    const payment = await prisma.payment.create({
        data: { ...data, transactionId },
    });
    // Sync booking status after creating payment
    await syncBookingStatusWithPayments(data.bookingId);
    return payment;
};
export const getAllPayments = async (options) => {
    const { page = 1, limit = 10, status, method } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {};
    if (status) {
        where.status = status;
    }
    if (method) {
        where.method = method;
    }
    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            skip,
            take: limit,
            include: {
                booking: {
                    include: { user: true, service: true },
                },
                invoice: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where }),
    ]);
    return {
        payments,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPayments: total,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    };
};
export const getPaymentById = async (id) => {
    return prisma.payment.findUnique({
        where: { id },
        include: { booking: true, invoice: true },
    });
};
export const updatePayment = async (id, data) => {
    return prisma.payment.update({ where: { id }, data });
};
export const deletePayment = async (id) => {
    return prisma.payment.delete({ where: { id } });
};
export const refundPayment = async (id, reason) => {
    const payment = await prisma.payment.findUnique({
        where: { id },
        include: { booking: true },
    });
    if (!payment) {
        throw new Error('Payment not found');
    }
    if (payment.status !== 'PAID') {
        throw new Error('Only paid payments can be refunded');
    }
    // Update payment status to refunded
    const refundedPayment = await prisma.payment.update({
        where: { id },
        data: {
            status: 'REFUNDED',
            gatewayResponse: reason ? `Refunded: ${reason}` : 'Refunded by admin',
        },
        include: { booking: true },
    });
    // Sync booking status after refunding payment
    await syncBookingStatusWithPayments(payment.bookingId);
    return refundedPayment;
};
export const markAsPaid = async (id) => {
    const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
            booking: {
                include: { user: true, service: true },
            },
        },
    });
    if (!payment) {
        throw new Error('Payment not found');
    }
    if (payment.status === 'PAID') {
        throw new Error('Payment is already marked as paid');
    }
    if (payment.status === 'REFUNDED') {
        throw new Error('Cannot mark a refunded payment as paid');
    }
    // Check if booking would be overpaid
    const isFullyPaid = await isBookingFullyPaid(payment.bookingId);
    if (isFullyPaid) {
        throw new Error('Cannot mark payment as paid: Booking is already fully paid');
    }
    const updatedPayment = await prisma.payment.update({
        where: { id },
        data: { status: 'PAID' },
        include: { booking: true },
    });
    // Sync booking status after marking payment as paid
    await syncBookingStatusWithPayments(payment.bookingId);
    return updatedPayment;
};
export const updatePaymentStatus = async (id, status) => {
    const payment = await prisma.payment.findUnique({
        where: { id },
        include: { booking: true },
    });
    if (!payment) {
        throw new Error('Payment not found');
    }
    // Additional validation for marking as paid
    if (status === 'PAID') {
        const isFullyPaid = await isBookingFullyPaid(payment.bookingId);
        if (isFullyPaid) {
            throw new Error('Cannot mark payment as paid: Booking is already fully paid');
        }
    }
    const updatedPayment = await prisma.payment.update({
        where: { id },
        data: { status: status },
        include: { booking: true },
    });
    // Sync booking status after updating payment status
    await syncBookingStatusWithPayments(payment.bookingId);
    return updatedPayment;
};
