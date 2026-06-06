import mongoose from 'mongoose';
import { Booking } from '../models/booking.model';
import { Payment } from '../models/payment.model';
import { Service } from '../models/service.model';
import { User } from '../models/user.model';
import logger from '../utils/logger';
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
        return User.findOne({ email, deletedAt: null, isActive: true }, projection).populate('roleId');
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
        return User.findOne({ _id: id, deletedAt: null, isActive: true }, projection).populate('roleId');
    }
    async getBookingsByUserId(userId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const where = { userId, ...(status && { status }) };
        const [bookings, total] = await Promise.all([
            Booking.find(where)
                .populate({ path: 'serviceId', select: 'id type description price estimatedTime' })
                .populate('payments')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Booking.countDocuments(where),
        ]);
        return { bookings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    async getActiveServices() {
        return Service.find({ isActive: true }).sort({ type: 1, price: 1 });
    }
    async getBookingStats(startDate, endDate) {
        const dateFilter = startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};
        const [totalBookings, statusCounts, revenueData, popularServices] = await Promise.all([
            Booking.countDocuments(dateFilter),
            Booking.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Payment.aggregate([
                {
                    $match: {
                        status: 'PAID',
                        ...(startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
                    },
                },
                { $group: { _id: null, total: { $sum: '$amount' }, avg: { $avg: '$amount' } } },
            ]),
            Booking.aggregate([
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
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const result = await callback(session);
            await session.commitTransaction();
            return result;
        }
        catch (error) {
            await session.abortTransaction();
            logger.error('Transaction failed:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async healthCheck() {
        try {
            await mongoose.connection.db?.admin().ping();
            return true;
        }
        catch (error) {
            logger.error('Database health check failed:', error);
            return false;
        }
    }
    async disconnect() {
        await mongoose.disconnect();
    }
}
export default DatabaseService;
