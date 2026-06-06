"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBookingStatus = exports.updateBooking = exports.getBookingById = exports.getBookingsByUserId = exports.getAllBookings = exports.createBooking = void 0;
/* eslint-disable no-console */
const delivery_fees_1 = require("../config/delivery-fees");
const booking_model_1 = require("../models/booking.model");
const service_model_1 = require("../models/service.model");
const user_model_1 = require("../models/user.model");
const email_service_1 = require("./email.service");
const withRelations = (query) => query.populate('userId').populate('serviceId').populate('payments');
const createBooking = async (data) => {
    const deliveryFee = data.deliveryFee ?? (0, delivery_fees_1.calculateDeliveryFee)(data.deliveryAddress);
    const booking = await booking_model_1.Booking.create({ ...data, deliveryFee });
    const [user, service] = await Promise.all([
        user_model_1.User.findById(booking.userId),
        service_model_1.Service.findById(booking.serviceId),
    ]);
    try {
        await (0, email_service_1.sendBookingConfirmationEmail)(user.email, user.name, service.title, booking.pickupAddress, booking.deliveryAddress, booking.date, booking.pickupTime, Number(booking.totalAmount), booking._id.toString());
    }
    catch (emailError) {
        console.error('Failed to send booking confirmation email:', emailError);
    }
    return withRelations(booking_model_1.Booking.findById(booking._id));
};
exports.createBooking = createBooking;
const getAllBookings = async () => {
    return withRelations(booking_model_1.Booking.find());
};
exports.getAllBookings = getAllBookings;
const getBookingsByUserId = async (userId) => {
    return withRelations(booking_model_1.Booking.find({ userId })).sort({ createdAt: -1 });
};
exports.getBookingsByUserId = getBookingsByUserId;
const getBookingById = async (id) => {
    return withRelations(booking_model_1.Booking.findById(id));
};
exports.getBookingById = getBookingById;
const updateBooking = async (id, data) => {
    return booking_model_1.Booking.findByIdAndUpdate(id, data, { new: true });
};
exports.updateBooking = updateBooking;
const updateBookingStatus = async (id, status) => {
    return withRelations(booking_model_1.Booking.findByIdAndUpdate(id, { status }, { new: true }));
};
exports.updateBookingStatus = updateBookingStatus;
const deleteBooking = async (id) => {
    return booking_model_1.Booking.findByIdAndDelete(id);
};
exports.deleteBooking = deleteBooking;
