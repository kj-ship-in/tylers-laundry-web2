import { calculateDeliveryFee } from '../config/delivery-fees';
import prisma from '../lib/prisma';
import { sendBookingConfirmationEmail } from './email.service';
export const createBooking = async (data) => {
    // If deliveryFee is not provided, calculate it automatically from delivery address
    const deliveryFee = data.deliveryFee ?? calculateDeliveryFee(data.deliveryAddress);
    const bookingData = {
        ...data,
        deliveryFee,
    };
    const booking = await prisma.booking.create({
        data: bookingData,
        include: { user: true, service: true },
    });
    // Send booking confirmation email
    try {
        await sendBookingConfirmationEmail(booking.user.email, booking.user.name, booking.service.title, booking.pickupAddress, booking.deliveryAddress, booking.date, booking.pickupTime, Number(booking.totalAmount), booking.id);
    }
    catch (emailError) {
        // Log error but don't fail the booking creation
        // eslint-disable-next-line no-console
        console.error('Failed to send booking confirmation email:', emailError);
    }
    return booking;
};
export const getAllBookings = async () => {
    return prisma.booking.findMany({
        include: { user: true, service: true, payments: true },
    });
};
export const getBookingsByUserId = async (userId) => {
    return prisma.booking.findMany({
        where: { userId },
        include: { user: true, service: true, payments: true },
        orderBy: { createdAt: 'desc' },
    });
};
export const getBookingById = async (id) => {
    return prisma.booking.findUnique({
        where: { id },
        include: { user: true, service: true, payments: true },
    });
};
export const updateBooking = async (id, data) => {
    return prisma.booking.update({ where: { id }, data });
};
export const updateBookingStatus = async (id, status) => {
    return prisma.booking.update({
        where: { id },
        data: { status: status },
        include: { user: true, service: true, payments: true },
    });
};
export const deleteBooking = async (id) => {
    return prisma.booking.delete({ where: { id } });
};
