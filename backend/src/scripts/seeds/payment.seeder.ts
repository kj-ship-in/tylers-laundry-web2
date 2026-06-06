/* eslint-disable no-console */
import { IBooking } from '../../models/booking.model';
import { Payment, IPayment } from '../../models/payment.model';
import { BookingStatus, PaymentMethod, PaymentStatus } from '../../types/enums';

export async function clearPayments(): Promise<void> {
  await Payment.deleteMany({});
  console.log('  Cleared: payments');
}

export async function seedPayments(bookings: IBooking[]): Promise<IPayment[]> {
  const paidBookings = bookings.filter(b =>
    [BookingStatus.DELIVERED, BookingStatus.COMPLETED].includes(b.status),
  );

  const methods = [
    PaymentMethod.WAVE,
    PaymentMethod.CASH,
    PaymentMethod.BANK,
    PaymentMethod.APS,
    PaymentMethod.YONNA,
  ];

  const payments = await Promise.all(
    paidBookings.map((booking, i) =>
      Payment.create({
        bookingId: booking._id,
        transactionId: `TXN-${String(i + 1).padStart(4, '0')}`,
        amount: booking.totalAmount,
        currency: 'GMD',
        method: methods[i % methods.length],
        status: PaymentStatus.PAID,
        gatewayResponse: 'Success — payment confirmed',
      }),
    ),
  );

  console.log(`  Seeded: payments (${payments.length} records)`);
  return payments;
}
