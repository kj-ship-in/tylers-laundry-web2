/* eslint-disable @typescript-eslint/no-explicit-any */
import { Testimonial } from '../models/testimonial.model';
const withUser = async (query) => {
    const result = await query
        .populate({ path: 'userId', select: '_id name profileUrl' })
        .lean();
    if (!result)
        return null;
    const transform = (doc) => {
        const { userId, ...rest } = doc;
        return { ...rest, user: userId ?? null };
    };
    return Array.isArray(result) ? result.map(transform) : transform(result);
};
export const createTestimonialService = async (data) => {
    if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    const existing = await Testimonial.findOne({ userId: data.userId, isActive: true });
    if (existing) {
        return withUser(Testimonial.findByIdAndUpdate(existing._id, { ...data, isApproved: false }, { new: true }));
    }
    const created = await Testimonial.create(data);
    return withUser(Testimonial.findById(created._id));
};
export const getAllTestimonialsService = async (options) => {
    const { page = 1, limit = 10, rating, isApproved = true, isActive = true } = options ?? {};
    const skip = (page - 1) * limit;
    const query = { isActive, isApproved };
    if (rating !== undefined)
        query.rating = rating;
    const [testimonials, total] = await Promise.all([
        withUser(Testimonial.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)),
        Testimonial.countDocuments(query),
    ]);
    return {
        testimonials,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};
export const getAllAdminTestimonialsService = async (options) => {
    const { page = 1, limit = 10, rating, isApproved, isActive } = options ?? {};
    const skip = (page - 1) * limit;
    const query = {};
    if (isActive !== undefined)
        query.isActive = isActive;
    if (isApproved !== undefined)
        query.isApproved = isApproved;
    if (rating !== undefined)
        query.rating = rating;
    const [testimonials, total] = await Promise.all([
        withUser(Testimonial.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)),
        Testimonial.countDocuments(query),
    ]);
    return {
        testimonials,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};
export const getTestimonialByIdService = async (id) => {
    return withUser(Testimonial.findById(id));
};
export const getUserTestimonialsService = async (userId, options) => {
    const { page = 1, limit = 10 } = options ?? {};
    const skip = (page - 1) * limit;
    const query = { userId, isActive: true };
    const [testimonials, total] = await Promise.all([
        withUser(Testimonial.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)),
        Testimonial.countDocuments(query),
    ]);
    return {
        testimonials,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};
export const updateTestimonialService = async (id, userId, data) => {
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
    }
    const testimonial = await Testimonial.findOne({ _id: id, userId, isActive: true });
    if (!testimonial)
        throw new Error('Testimonial not found or access denied');
    return withUser(Testimonial.findByIdAndUpdate(id, { ...data, ...(testimonial.isApproved ? {} : { isApproved: false }) }, { new: true }));
};
export const deleteTestimonialService = async (id, userId) => {
    const testimonial = await Testimonial.findOne({ _id: id, userId, isActive: true });
    if (!testimonial)
        throw new Error('Testimonial not found or access denied');
    return Testimonial.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
export const approveTestimonialService = async (id) => {
    const testimonial = await Testimonial.findById(id);
    if (!testimonial)
        throw new Error('Testimonial not found');
    if (!testimonial.isActive)
        throw new Error('Cannot approve inactive testimonial');
    return withUser(Testimonial.findByIdAndUpdate(id, { isApproved: true }, { new: true }));
};
export const getTestimonialStatsService = async () => {
    const [totalCount, approvedCount, pendingCount, avgResult, ratingDistribution] = await Promise.all([
        Testimonial.countDocuments({ isActive: true }),
        Testimonial.countDocuments({ isActive: true, isApproved: true }),
        Testimonial.countDocuments({ isActive: true, isApproved: false }),
        Testimonial.aggregate([
            { $match: { isActive: true, isApproved: true } },
            { $group: { _id: null, avg: { $avg: '$rating' } } },
        ]),
        Testimonial.aggregate([
            { $match: { isActive: true, isApproved: true } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
    ]);
    return {
        totalCount,
        approvedCount,
        pendingCount,
        averageRating: avgResult[0]?.avg ?? 0,
        ratingDistribution: ratingDistribution.map((item) => ({
            rating: item._id,
            count: item.count,
        })),
    };
};
