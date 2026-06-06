"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatus = exports.markAsPaid = exports.refundPayment = exports.deletePayment = exports.updatePayment = exports.getPaymentById = exports.getAllPayments = exports.createPayment = exports.syncBookingStatusWithPayments = exports.isBookingFullyPaid = void 0;
const booking_model_1 = require("../models/booking.model");
const payment_model_1 = require("../models/payment.model");
const enums_1 = require("../types/enums");
const helper_1 = require("../utils/helper");
const isBookingFullyPaid = async (bookingId) => {
    const booking = await booking_model_1.Booking.findById(bookingId);
    if (!booking)
        throw new Error('Booking not found');
    const payments = await payment_model_1.Payment.find({ bookingId, status: enums_1.PaymentStatus.PAID });
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return totalPaid >= Number(booking.totalAmount);
};
exports.isBookingFullyPaid = isBookingFullyPaid;
const syncBookingStatusWithPayments = async (bookingId) => {
    const booking = await booking_model_1.Booking.findById(bookingId);
    if (!booking)
        return;
    const payments = await payment_model_1.Payment.find({ bookingId });
    const hasPaidPayments = payments.some(p => p.status === 'PAID');
    const isFullyPaid = await (0, exports.isBookingFullyPaid)(bookingId);
    const hasFailedPayments = payments.some(p => p.status === 'FAILED');
    const hasRefundedPayments = payments.some(p => p.status === 'REFUNDED');
    let newStatus = booking.status;
    if (isFullyPaid && booking.status !== 'COMPLETED' && booking.status !== 'DELIVERED') {
        newStatus = 'COMPLETED';
    }
    else if (hasRefundedPayments && !hasPaidPayments) {
        newStatus = 'CANCELLED';
    }
    else if (hasFailedPayments && !hasPaidPayments && booking.status === 'PENDING') {
        newStatus = 'PENDING';
    }
    if (newStatus !== booking.status) {
        await booking_model_1.Booking.findByIdAndUpdate(bookingId, { status: newStatus });
    }
};
exports.syncBookingStatusWithPayments = syncBookingStatusWithPayments;
const createPayment = async (data) => {
    const isFullyPaid = await (0, exports.isBookingFullyPaid)(data.bookingId);
    if (isFullyPaid)
        throw new Error('Cannot create payment: Booking is already fully paid');
    const transactionId = (0, helper_1.generateTransactionId)();
    const payment = await payment_model_1.Payment.create({ ...data, transactionId });
    await (0, exports.syncBookingStatusWithPayments)(data.bookingId);
    return payment;
};
exports.createPayment = createPayment;
const getAllPayments = async (options) => {
    const { page = 1, limit = 10, status, method } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {};
    if (status)
        where.status = status;
    if (method)
        where.method = method;
    const [payments, total] = await Promise.all([
        payment_model_1.Payment.find(where)
            .populate({ path: 'bookingId', populate: [{ path: 'userId' }, { path: 'serviceId' }] })
            .populate('invoice')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        payment_model_1.Payment.countDocuments(where),
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
exports.getAllPayments = getAllPayments;
const getPaymentById = async (id) => {
    return payment_model_1.Payment.findById(id)
        .populate({ path: 'bookingId', populate: [{ path: 'userId' }, { path: 'serviceId' }] })
        .populate('invoice');
};
exports.getPaymentById = getPaymentById;
const updatePayment = async (id, data) => {
    return payment_model_1.Payment.findByIdAndUpdate(id, data, { new: true });
};
exports.updatePayment = updatePayment;
const deletePayment = async (id) => {
    return payment_model_1.Payment.findByIdAndDelete(id);
};
exports.deletePayment = deletePayment;
const refundPayment = async (id, reason) => {
    const payment = await payment_model_1.Payment.findById(id).populate('bookingId');
    if (!payment)
        throw new Error('Payment not found');
    if (payment.status !== 'PAID')
        throw new Error('Only paid payments can be refunded');
    const refunded = await payment_model_1.Payment.findByIdAndUpdate(id, {
        status: 'REFUNDED',
        gatewayResponse: reason ? `Refunded: ${reason}` : 'Refunded by admin',
    }, { new: true }).populate('bookingId');
    await (0, exports.syncBookingStatusWithPayments)(payment.bookingId.toString());
    return refunded;
};
exports.refundPayment = refundPayment;
const markAsPaid = async (id) => {
    const payment = await payment_model_1.Payment.findById(id).populate({
        path: 'bookingId',
        populate: [{ path: 'userId' }, { path: 'serviceId' }],
    });
    if (!payment)
        throw new Error('Payment not found');
    if (payment.status === 'PAID')
        throw new Error('Payment is already marked as paid');
    if (payment.status === 'REFUNDED')
        throw new Error('Cannot mark a refunded payment as paid');
    const bookingId = payment.bookingId.toString();
    const isFullyPaid = await (0, exports.isBookingFullyPaid)(bookingId);
    if (isFullyPaid)
        throw new Error('Cannot mark payment as paid: Booking is already fully paid');
    const updated = await payment_model_1.Payment.findByIdAndUpdate(id, { status: 'PAID' }, { new: true }).populate('bookingId');
    await (0, exports.syncBookingStatusWithPayments)(bookingId);
    return updated;
};
exports.markAsPaid = markAsPaid;
const updatePaymentStatus = async (id, status) => {
    const payment = await payment_model_1.Payment.findById(id).populate('bookingId');
    if (!payment)
        throw new Error('Payment not found');
    const bookingId = payment.bookingId.toString();
    if (status === 'PAID') {
        const isFullyPaid = await (0, exports.isBookingFullyPaid)(bookingId);
        if (isFullyPaid) {
            throw new Error('Cannot mark payment as paid: Booking is already fully paid');
        }
    }
    const updated = await payment_model_1.Payment.findByIdAndUpdate(id, { status: status }, { new: true }).populate('bookingId');
    await (0, exports.syncBookingStatusWithPayments)(bookingId);
    return updated;
};
exports.updatePaymentStatus = updatePaymentStatus;
