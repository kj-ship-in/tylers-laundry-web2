/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../lib/prisma';
export const createTestimonialService = async (data) => {
    if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    // Check if user already has an active testimonial
    const existingTestimonial = await prisma.testimonial.findFirst({
        where: {
            userId: data.userId,
            isActive: true,
        },
    });
    if (existingTestimonial) {
        // Update existing testimonial
        return await prisma.testimonial.update({
            where: { id: existingTestimonial.id },
            data: {
                ...data,
                isApproved: false, // Reset approval status when updated
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileUrl: true,
                    },
                },
            },
        });
    }
    else {
        // Create new testimonial
        return await prisma.testimonial.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileUrl: true,
                    },
                },
            },
        });
    }
};
export const getAllTestimonialsService = async (options) => {
    const { page = 1, limit = 10, rating, isApproved = true, isActive = true, } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {
        isActive,
        isApproved,
    };
    if (rating !== undefined) {
        where.rating = rating;
    }
    const [testimonials, total] = await Promise.all([
        prisma.testimonial.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileUrl: true,
                    },
                },
            },
        }),
        prisma.testimonial.count({ where }),
    ]);
    return {
        testimonials,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const getAllAdminTestimonialsService = async (options) => {
    const { page = 1, limit = 10, rating, isApproved, isActive } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {};
    if (isActive !== undefined) {
        where.isActive = isActive;
    }
    if (isApproved !== undefined) {
        where.isApproved = isApproved;
    }
    if (rating !== undefined) {
        where.rating = rating;
    }
    const [testimonials, total] = await Promise.all([
        prisma.testimonial.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileUrl: true,
                    },
                },
            },
        }),
        prisma.testimonial.count({ where }),
    ]);
    return {
        testimonials,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const getTestimonialByIdService = async (id) => {
    return await prisma.testimonial.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profileUrl: true,
                },
            },
        },
    });
};
export const getUserTestimonialsService = async (userId, options) => {
    const { page = 1, limit = 10 } = options ?? {};
    const skip = (page - 1) * limit;
    const [testimonials, total] = await Promise.all([
        prisma.testimonial.findMany({
            where: {
                userId,
                isActive: true,
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileUrl: true,
                    },
                },
            },
        }),
        prisma.testimonial.count({
            where: {
                userId,
                isActive: true,
            },
        }),
    ]);
    return {
        testimonials,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const updateTestimonialService = async (id, userId, data) => {
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
    }
    const testimonial = await prisma.testimonial.findFirst({
        where: {
            id,
            userId,
            isActive: true,
        },
    });
    if (!testimonial) {
        throw new Error('Testimonial not found or access denied');
    }
    return await prisma.testimonial.update({
        where: { id },
        data: {
            ...data,
            ...(testimonial.isApproved ? {} : { isApproved: false }),
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profileUrl: true,
                },
            },
        },
    });
};
export const deleteTestimonialService = async (id, userId) => {
    const testimonial = await prisma.testimonial.findFirst({
        where: {
            id,
            userId,
            isActive: true,
        },
    });
    if (!testimonial) {
        throw new Error('Testimonial not found or access denied');
    }
    return await prisma.testimonial.update({
        where: { id },
        data: { isActive: false },
    });
};
export const approveTestimonialService = async (id) => {
    const testimonial = await prisma.testimonial.findUnique({
        where: { id },
    });
    if (!testimonial) {
        throw new Error('Testimonial not found');
    }
    if (!testimonial.isActive) {
        throw new Error('Cannot approve inactive testimonial');
    }
    return await prisma.testimonial.update({
        where: { id },
        data: { isApproved: true },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profileUrl: true,
                },
            },
        },
    });
};
export const getTestimonialStatsService = async () => {
    const [totalCount, approvedCount, pendingCount, averageRating, ratingDistribution,] = await Promise.all([
        prisma.testimonial.count({
            where: { isActive: true },
        }),
        prisma.testimonial.count({
            where: { isActive: true, isApproved: true },
        }),
        prisma.testimonial.count({
            where: { isActive: true, isApproved: false },
        }),
        prisma.testimonial.aggregate({
            where: { isActive: true, isApproved: true },
            _avg: { rating: true },
        }),
        prisma.testimonial.groupBy({
            by: ['rating'],
            where: { isActive: true, isApproved: true },
            _count: { rating: true },
            orderBy: { rating: 'asc' },
        }),
    ]);
    return {
        totalCount,
        approvedCount,
        pendingCount,
        averageRating: averageRating._avg.rating ?? 0,
        ratingDistribution: ratingDistribution.map(item => ({
            rating: item.rating,
            count: item._count.rating,
        })),
    };
};
