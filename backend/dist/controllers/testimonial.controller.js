"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestimonialStatsController = exports.approveTestimonialController = exports.deleteTestimonialController = exports.updateTestimonialController = exports.getUserTestimonialsController = exports.getTestimonialByIdController = exports.getAllAdminTestimonialsController = exports.getAllTestimonialsController = exports.createTestimonialController = void 0;
const testimonial_model_1 = require("../models/testimonial.model");
const testimonial_service_1 = require("../services/testimonial.service");
const testimonial_schema_1 = require("../validators/testimonial.schema");
const createTestimonialController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const validatedData = testimonial_schema_1.CreateTestimonialSchema.parse(req.body);
        const testimonial = await (0, testimonial_service_1.createTestimonialService)({
            userId,
            ...validatedData,
        });
        return res.status(201).json({
            message: 'Testimonial created successfully',
            data: testimonial,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTestimonialController = createTestimonialController;
const getAllTestimonialsController = async (req, res, next) => {
    try {
        const queryParams = testimonial_schema_1.GetTestimonialsQuerySchema.parse(req.query);
        const result = await (0, testimonial_service_1.getAllTestimonialsService)(queryParams);
        return res
            .set('Cache-Control', 'no-cache, no-store, must-revalidate')
            .set('Pragma', 'no-cache')
            .set('Expires', '0')
            .status(200)
            .json({
            message: 'Testimonials retrieved successfully',
            data: result.testimonials,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllTestimonialsController = getAllTestimonialsController;
const getAllAdminTestimonialsController = async (req, res, next) => {
    try {
        const queryParams = testimonial_schema_1.GetTestimonialsQuerySchema.parse(req.query);
        const result = await (0, testimonial_service_1.getAllAdminTestimonialsService)(queryParams);
        return res
            .set('Cache-Control', 'no-cache, no-store, must-revalidate')
            .set('Pragma', 'no-cache')
            .set('Expires', '0')
            .status(200)
            .json({
            message: 'Testimonials retrieved successfully',
            data: result.testimonials,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllAdminTestimonialsController = getAllAdminTestimonialsController;
const getTestimonialByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const testimonial = await (0, testimonial_service_1.getTestimonialByIdService)(id);
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }
        return res.status(200).json(testimonial);
    }
    catch (error) {
        next(error);
    }
};
exports.getTestimonialByIdController = getTestimonialByIdController;
const getUserTestimonialsController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const raw = await testimonial_model_1.Testimonial.findOne({ userId, isActive: true })
            .populate({ path: 'userId', select: '_id name profileUrl' })
            .lean();
        const testimonial = raw
            ? (() => { const { userId: u, ...rest } = raw; return { ...rest, user: u ?? null }; })()
            : null;
        return res
            .set('Cache-Control', 'no-cache, no-store, must-revalidate')
            .set('Pragma', 'no-cache')
            .set('Expires', '0')
            .status(200)
            .json(testimonial);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserTestimonialsController = getUserTestimonialsController;
const updateTestimonialController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { id } = req.params;
        const validatedData = testimonial_schema_1.UpdateTestimonialSchema.parse(req.body);
        const testimonial = await (0, testimonial_service_1.updateTestimonialService)(id, userId, validatedData);
        return res.status(200).json({
            message: 'Testimonial updated successfully',
            data: testimonial,
        });
    }
    catch (error) {
        if (error.message === 'Testimonial not found or access denied') {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};
exports.updateTestimonialController = updateTestimonialController;
const deleteTestimonialController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { id } = req.params;
        await (0, testimonial_service_1.deleteTestimonialService)(id, userId);
        return res.status(200).json({
            message: 'Testimonial deleted successfully',
        });
    }
    catch (error) {
        if (error.message === 'Testimonial not found or access denied') {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};
exports.deleteTestimonialController = deleteTestimonialController;
const approveTestimonialController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const testimonial = await (0, testimonial_service_1.approveTestimonialService)(id);
        return res.status(200).json({
            message: 'Testimonial approved successfully',
            data: testimonial,
        });
    }
    catch (error) {
        if (error.message === 'Testimonial not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Cannot approve inactive testimonial') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};
exports.approveTestimonialController = approveTestimonialController;
const getTestimonialStatsController = async (_, res, next) => {
    try {
        const stats = await (0, testimonial_service_1.getTestimonialStatsService)();
        return res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
};
exports.getTestimonialStatsController = getTestimonialStatsController;
