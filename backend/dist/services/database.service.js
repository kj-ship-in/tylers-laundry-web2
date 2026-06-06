"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const booking_model_1 = require("../models/booking.model");
const payment_model_1 = require("../models/payment.model");
const service_model_1 = require("../models/service.model");
const user_model_1 = require("../models/user.model");
const logger_1 = __importDefault(require("../utils/logger"));
class DatabaseService {
    async findUserByEmail(email, includePassword = false) {
        const projection = {
            name: 1,
            email: 1,
            roleId: 1,
            phone: 1,
            address: 1,
            profileUrl: 1,
            lastLogin: 1,
            isVerified: 1,
            isBiometricsEnabled: 1,
            createdAt: 1,
            updatedAt: 1,
        };
        if (includePassword)
            projection.password = 1;
        return user_model_1.User.findOne({ email, deletedAt: null, isActive: true }, projection).populate('roleId');
    }
    async findUserById(id, includePassword = false) {
        const projection = {
            name: 1,
            email: 1,
            roleId: 1,
            phone: 1,
            address: 1,
            profileUrl: 1,
            lastLogin: 1,
            isVerified: 1,
            isBiometricsEnabled: 1,
            createdAt: 1,
            updatedAt: 1,
        };
        if (includePassword)
            projection.password = 1;
        return user_model_1.User.findOne({ _id: id, deletedAt: null, isActive: true }, projection).populate('roleId');
    }
    async getBookingsByUserId(userId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const where = { userId, ...(status && { status }) };
        const [bookings, total] = await Promise.all([
            booking_model_1.Booking.find(where)
                .populate({ path: 'serviceId', select: 'id type description price estimatedTime' })
                .populate('payments')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            booking_model_1.Booking.countDocuments(where),
        ]);
        return { bookings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    async getActiveServices() {
        return service_model_1.Service.find({ isActive: true }).sort({ type: 1, price: 1 });
    }
    async getBookingStats(startDate, endDate) {
        const dateFilter = startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};
        const [totalBookings, statusCounts, revenueData, popularServices] = await Promise.all([
            booking_model_1.Booking.countDocuments(dateFilter),
            booking_model_1.Booking.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            payment_model_1.Payment.aggregate([
                {
                    $match: {
                        status: 'PAID',
                        ...(startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
                    },
                },
                { $group: { _id: null, total: { $sum: '$amount' }, avg: { $avg: '$amount' } } },
            ]),
            booking_model_1.Booking.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$serviceId', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
        ]);
        return {
            totalBookings,
            statusCounts: statusCounts.map((s) => ({ status: s._id, count: s.count })),
            revenue: { total: revenueData[0]?.total ?? 0, average: revenueData[0]?.avg ?? 0 },
            popularServices,
        };
    }
    async executeTransaction(callback) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const result = await callback(session);
            await session.commitTransaction();
            return result;
        }
        catch (error) {
            await session.abortTransaction();
            logger_1.default.error('Transaction failed:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async healthCheck() {
        try {
            await mongoose_1.default.connection.db?.admin().ping();
            return true;
        }
        catch (error) {
            logger_1.default.error('Database health check failed:', error);
            return false;
        }
    }
    async disconnect() {
        await mongoose_1.default.disconnect();
    }
}
exports.default = DatabaseService;
