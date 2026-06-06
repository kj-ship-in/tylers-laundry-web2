/* eslint-disable no-console */
import { calculateDeliveryFee } from '../config/delivery-fees';
import { Booking } from '../models/booking.model';
import { Service } from '../models/service.model';
import { User } from '../models/user.model';
import { sendBookingConfirmationEmail } from './email.service';
const withRelations = (query) => query.populate('userId').populate('serviceId').populate('payments');
export const createBooking = async (data) => {
    const deliveryFee = data.deliveryFee ?? calculateDeliveryFee(data.deliveryAddress);
    const booking = await Booking.create({ ...data, deliveryFee });
    const [user, service] = await Promise.all([
        User.findById(booking.userId),
        Service.findById(booking.serviceId),
    ]);
    try {
        await sendBookingConfirmationEmail(user.email, user.name, service.title, booking.pickupAddress, booking.deliveryAddress, booking.date, booking.pickupTime, Number(booking.totalAmount), booking._id.toString());
    }
    catch (emailError) {
        console.error('Failed to send booking confirmation email:', emailError);
    }
    return withRelations(Booking.findById(booking._id));
};
export const getAllBookings = async () => {
    return withRelations(Booking.find());
};
export const getBookingsByUserId = async (userId) => {
    return withRelations(Booking.find({ userId })).sort({ createdAt: -1 });
};
export const getBookingById = async (id) => {
    return withRelations(Booking.findById(id));
};
export const updateBooking = async (id, data) => {
    return Booking.findByIdAndUpdate(id, data, { new: true });
};
export const updateBookingStatus = async (id, status) => {
    return withRelations(Booking.findByIdAndUpdate(id, { status }, { new: true }));
};
export const deleteBooking = async (id) => {
    return Booking.findByIdAndDelete(id);
};
