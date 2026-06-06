import { Booking } from '../models/booking.model';
import { Payment } from '../models/payment.model';
import { PaymentStatus } from '../types/enums';
import { CreatePaymentRequest, UpdatePaymentRequest } from '../types/payment';
import { generateTransactionId } from '../utils/helper';

export const isBookingFullyPaid = async (bookingId: string): Promise<boolean> => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');

  const payments = await Payment.find({ bookingId, status: PaymentStatus.PAID });
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  return totalPaid >= Number(booking.totalAmount);
};

export const syncBookingStatusWithPayments = async (bookingId: string): Promise<void> => {
  const booking = await Booking.findById(bookingId);
  if (!booking) return;

  const payments = await Payment.find({ bookingId });
  const hasPaidPayments = payments.some(p => p.status === 'PAID');
  const isFullyPaid = await isBookingFullyPaid(bookingId);
  const hasFailedPayments = payments.some(p => p.status === 'FAILED');
  const hasRefundedPayments = payments.some(p => p.status === 'REFUNDED');

  let newStatus = booking.status as string;

  if (isFullyPaid && booking.status !== 'COMPLETED' && booking.status !== 'DELIVERED') {
    newStatus = 'COMPLETED';
  } else if (hasRefundedPayments && !hasPaidPayments) {
    newStatus = 'CANCELLED';
  } else if (hasFailedPayments && !hasPaidPayments && booking.status === 'PENDING') {
    newStatus = 'PENDING';
  }

  if (newStatus !== booking.status) {
    await Booking.findByIdAndUpdate(bookingId, { status: newStatus });
  }
};

export const createPayment = async (data: CreatePaymentRequest) => {
  const isFullyPaid = await isBookingFullyPaid(data.bookingId);
  if (isFullyPaid) throw new Error('Cannot create payment: Booking is already fully paid');

  const transactionId = generateTransactionId();
  const payment = await Payment.create({ ...data, transactionId });

  await syncBookingStatusWithPayments(data.bookingId);
  return payment;
};

export const getAllPayments = async (options?: {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
}) => {
  const { page = 1, limit = 10, status, method } = options ?? {};
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (method) where.method = method;

  const [payments, total] = await Promise.all([
    Payment.find(where)
      .populate({ path: 'bookingId', populate: [{ path: 'userId' }, { path: 'serviceId' }] })
      .populate('invoice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(where),
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

export const getPaymentById = async (id: string) => {
  return Payment.findById(id)
    .populate({ path: 'bookingId', populate: [{ path: 'userId' }, { path: 'serviceId' }] })
    .populate('invoice');
};

export const updatePayment = async (id: string, data: UpdatePaymentRequest) => {
  return Payment.findByIdAndUpdate(id, data, { new: true });
};

export const deletePayment = async (id: string) => {
  return Payment.findByIdAndDelete(id);
};

export const refundPayment = async (id: string, reason?: string) => {
  const payment = await Payment.findById(id).populate('bookingId');
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'PAID') throw new Error('Only paid payments can be refunded');

  const refunded = await Payment.findByIdAndUpdate(
    id,
    {
      status: 'REFUNDED',
      gatewayResponse: reason ? `Refunded: ${reason}` : 'Refunded by admin',
    },
    { new: true },
  ).populate('bookingId');

  await syncBookingStatusWithPayments((payment.bookingId as any).toString());
  return refunded;
};

export const markAsPaid = async (id: string) => {
  const payment = await Payment.findById(id).populate({
    path: 'bookingId',
    populate: [{ path: 'userId' }, { path: 'serviceId' }],
  });
  if (!payment) throw new Error('Payment not found');
  if (payment.status === 'PAID') throw new Error('Payment is already marked as paid');
  if (payment.status === 'REFUNDED') throw new Error('Cannot mark a refunded payment as paid');

  const bookingId = (payment.bookingId as any).toString();
  const isFullyPaid = await isBookingFullyPaid(bookingId);
  if (isFullyPaid) throw new Error('Cannot mark payment as paid: Booking is already fully paid');

  const updated = await Payment.findByIdAndUpdate(id, { status: 'PAID' }, { new: true }).populate(
    'bookingId',
  );
  await syncBookingStatusWithPayments(bookingId);
  return updated;
};

export const updatePaymentStatus = async (id: string, status: string) => {
  const payment = await Payment.findById(id).populate('bookingId');
  if (!payment) throw new Error('Payment not found');

  const bookingId = (payment.bookingId as any).toString();

  if (status === 'PAID') {
    const isFullyPaid = await isBookingFullyPaid(bookingId);
    if (isFullyPaid) {
      throw new Error('Cannot mark payment as paid: Booking is already fully paid');
    }
  }

  const updated = await Payment.findByIdAndUpdate(
    id,
    { status: status as any },
    { new: true },
  ).populate('bookingId');
  await syncBookingStatusWithPayments(bookingId);
  return updated;
};
