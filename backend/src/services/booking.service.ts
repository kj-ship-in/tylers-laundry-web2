/* eslint-disable no-console */
import { calculateDeliveryFee } from '../config/delivery-fees';
import { Booking } from '../models/booking.model';
import { Service } from '../models/service.model';
import { User } from '../models/user.model';

import { sendBookingConfirmationEmail } from './email.service';

const withRelations = (query: ReturnType<typeof Booking.find>) =>
  query.populate('userId').populate('serviceId').populate('payments');

export const createBooking = async (data: any) => {
  const deliveryFee = data.deliveryFee ?? calculateDeliveryFee(data.deliveryAddress);
  const booking = await Booking.create({ ...data, deliveryFee });

  const [user, service] = await Promise.all([
    User.findById(booking.userId),
    Service.findById(booking.serviceId),
  ]);

  try {
    await sendBookingConfirmationEmail(
      user!.email,
      user!.name,
      service!.title,
      booking.pickupAddress,
      booking.deliveryAddress,
      booking.date,
      booking.pickupTime,
      Number(booking.totalAmount),
      (booking._id as any).toString(),
    );
  } catch (emailError) {
    console.error('Failed to send booking confirmation email:', emailError);
  }

  return withRelations(Booking.findById(booking._id) as any);
};

export const getAllBookings = async () => {
  return withRelations(Booking.find() as any);
};

export const getBookingsByUserId = async (userId: string) => {
  return withRelations(Booking.find({ userId }) as any).sort({ createdAt: -1 });
};

export const getBookingById = async (id: string) => {
  return withRelations(Booking.findById(id) as any);
};

export const updateBooking = async (id: string, data: any) => {
  return Booking.findByIdAndUpdate(id, data, { new: true });
};

export const updateBookingStatus = async (id: string, status: string) => {
  return withRelations(
    Booking.findByIdAndUpdate(id, { status }, { new: true }) as any,
  );
};

export const deleteBooking = async (id: string) => {
  return Booking.findByIdAndDelete(id);
};
