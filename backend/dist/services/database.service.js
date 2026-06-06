import logger from '../utils/logger';
class DatabaseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUserByEmail(email, includePassword = false) {
        return this.prisma.user.findUnique({
            where: {
                email,
                deletedAt: null,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: includePassword,
                role: true,
                phone: true,
                address: true,
                profileUrl: true,
                lastLogin: true,
                isVerified: true,
                isBiometricsEnabled: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findUserById(id, includePassword = false) {
        return this.prisma.user.findUnique({
            where: {
                id,
                deletedAt: null,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: includePassword,
                role: true,
                phone: true,
                address: true,
                profileUrl: true,
                lastLogin: true,
                isVerified: true,
                isBiometricsEnabled: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async getBookingsByUserId(userId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const where = {
            userId,
            ...(status && { status }),
        };
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                include: {
                    service: {
                        select: {
                            id: true,
                            type: true,
                            description: true,
                            price: true,
                            estimatedTime: true,
                        },
                    },
                    payments: {
                        select: {
                            id: true,
                            transactionId: true,
                            amount: true,
                            method: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.booking.count({ where }),
        ]);
        return {
            bookings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getActiveServices() {
        return this.prisma.service.findMany({
            where: { isActive: true },
            orderBy: [{ type: 'asc' }, { price: 'asc' }],
        });
    }
    async getBookingStats(startDate, endDate) {
        const where = {
            ...(startDate &&
                endDate && {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            }),
        };
        const [totalBookings, statusCounts, revenueData, popularServices] = await Promise.all([
            this.prisma.booking.count({ where }),
            this.prisma.booking.groupBy({
                by: ['status'],
                where,
                _count: {
                    status: true,
                },
            }),
            this.prisma.payment.aggregate({
                where: {
                    status: 'PAID',
                    ...(startDate &&
                        endDate && {
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    }),
                },
                _sum: {
                    amount: true,
                },
                _avg: {
                    amount: true,
                },
            }),
            this.prisma.booking.groupBy({
                by: ['serviceId'],
                where,
                _count: {
                    serviceId: true,
                },
                orderBy: {
                    _count: {
                        serviceId: 'desc',
                    },
                },
                take: 5,
            }),
        ]);
        return {
            totalBookings,
            statusCounts,
            revenue: {
                total: revenueData._sum.amount ?? 0,
                average: revenueData._avg.amount ?? 0,
            },
            popularServices,
        };
    }
    async executeTransaction(callback) {
        try {
            return await this.prisma.$transaction(callback);
        }
        catch (error) {
            logger.error('Transaction failed:', error);
            throw error;
        }
    }
    async healthCheck() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            logger.error('Database health check failed:', error);
            return false;
        }
    }
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
export default DatabaseService;
