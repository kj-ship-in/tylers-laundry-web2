"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerService = exports.updateUserStatusService = exports.deleteStaffService = exports.getBookingReportsService = exports.getDashboardDataService = void 0;
const booking_model_1 = require("../models/booking.model");
const payment_model_1 = require("../models/payment.model");
const role_model_1 = require("../models/role.model");
const user_model_1 = require("../models/user.model");
const enums_1 = require("../types/enums");
const getDashboardDataService = async () => {
    const [userRole, staffRole] = await Promise.all([
        role_model_1.Role.findOne({ name: 'USER' }),
        role_model_1.Role.findOne({ name: 'STAFF' }),
    ]);
    const [totalUsers, totalStaff, totalCustomers, totalBookings, pendingBookings, completedBookings] = await Promise.all([
        user_model_1.User.countDocuments(),
        staffRole ? user_model_1.User.countDocuments({ roleId: staffRole._id }) : 0,
        userRole ? user_model_1.User.countDocuments({ roleId: userRole._id }) : 0,
        booking_model_1.Booking.countDocuments(),
        booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.PENDING }),
        booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.COMPLETED }),
    ]);
    const revenueResult = await payment_model_1.Payment.aggregate([
        { $match: { status: enums_1.PaymentStatus.PAID } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total ?? 0;
    const recentBookings = await booking_model_1.Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId')
        .populate('serviceId')
        .populate('payments');
    return {
        users: { totalUsers, totalStaff, totalCustomers },
        bookings: { totalBookings, pendingBookings, completedBookings, recentBookings },
        revenue: totalRevenue,
    };
};
exports.getDashboardDataService = getDashboardDataService;
const getBookingReportsService = async (from, to) => {
    const bookings = await booking_model_1.Booking.find({ date: { $gte: from, $lte: to } })
        .populate('userId')
        .populate('serviceId')
        .populate('payments');
    const revenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    return { bookings, revenue };
};
exports.getBookingReportsService = getBookingReportsService;
const deleteStaffService = async (staffId) => {
    const staff = await user_model_1.User.findById(staffId).populate('roleId');
    if (!staff)
        throw new Error('Staff not found');
    if (staff.roleId?.name !== 'STAFF')
        throw new Error('User is not a staff member');
    const timestamp = Date.now();
    const anonymizedEmail = `deleted_staff_${timestamp}_${staffId.slice(-6)}@deleted.com`;
    return user_model_1.User.findByIdAndUpdate(staffId, { deletedAt: new Date(), email: anonymizedEmail, isActive: false, deletionReason: 'ADMIN_DELETED' }, { new: true, select: 'id email isActive deletedAt deletionReason' });
};
exports.deleteStaffService = deleteStaffService;
const updateUserStatusService = async (userId, isActive) => {
    const user = await user_model_1.User.findById(userId).populate('roleId');
    if (!user)
        throw new Error('User not found');
    return user_model_1.User.findByIdAndUpdate(userId, { isActive }, { new: true, select: 'id email name isActive' });
};
exports.updateUserStatusService = updateUserStatusService;
const deleteCustomerService = async (customerId) => {
    const customer = await user_model_1.User.findById(customerId).populate('roleId');
    if (!customer)
        throw new Error('Customer not found');
    if (customer.roleId?.name !== 'USER')
        throw new Error('User is not a customer');
    const timestamp = Date.now();
    const anonymizedEmail = `deleted_customer_${timestamp}_${customerId.slice(-6)}@deleted.com`;
    return user_model_1.User.findByIdAndUpdate(customerId, { deletedAt: new Date(), email: anonymizedEmail, isActive: false, deletionReason: 'ADMIN_DELETED' }, { new: true, select: 'id email isActive deletedAt deletionReason' });
};
exports.deleteCustomerService = deleteCustomerService;
