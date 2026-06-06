/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import { Testimonial } from '../models/testimonial.model';
import {
  createTestimonialService,
  getAllTestimonialsService,
  getTestimonialByIdService,
  updateTestimonialService,
  deleteTestimonialService,
  approveTestimonialService,
  getTestimonialStatsService,
  getAllAdminTestimonialsService,
} from '../services/testimonial.service';
import {
  CreateTestimonialSchema,
  UpdateTestimonialSchema,
  GetTestimonialsQuerySchema,
} from '../validators/testimonial.schema';

export const createTestimonialController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const validatedData = CreateTestimonialSchema.parse(req.body);

    const testimonial = await createTestimonialService({
      userId,
      ...validatedData,
    });

    return res.status(201).json({
      message: 'Testimonial created successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTestimonialsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const queryParams = GetTestimonialsQuerySchema.parse(req.query);

    const result = await getAllTestimonialsService(queryParams);

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
  } catch (error) {
    next(error);
  }
};

export const getAllAdminTestimonialsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const queryParams = GetTestimonialsQuerySchema.parse(req.query);

    const result = await getAllAdminTestimonialsService(queryParams);

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
  } catch (error) {
    next(error);
  }
};

export const getTestimonialByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { id } = req.params;

    const testimonial = await getTestimonialByIdService(id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    return res.status(200).json(testimonial);
  } catch (error) {
    next(error);
  }
};

export const getUserTestimonialsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const raw = await Testimonial.findOne({ userId, isActive: true })
      .populate({ path: 'userId', select: '_id name profileUrl' })
      .lean();

    const testimonial = raw
      ? (() => { const { userId: u, ...rest } = raw as any; return { ...rest, user: u ?? null }; })()
      : null;

    return res
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .status(200)
      .json(testimonial);
  } catch (error) {
    next(error);
  }
};

export const updateTestimonialController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const validatedData = UpdateTestimonialSchema.parse(req.body);

    const testimonial = await updateTestimonialService(
      id,
      userId,
      validatedData,
    );

    return res.status(200).json({
      message: 'Testimonial updated successfully',
      data: testimonial,
    });
  } catch (error: any) {
    if (error.message === 'Testimonial not found or access denied') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteTestimonialController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    await deleteTestimonialService(id, userId);

    return res.status(200).json({
      message: 'Testimonial deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Testimonial not found or access denied') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const approveTestimonialController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { id } = req.params;

    const testimonial = await approveTestimonialService(id);

    return res.status(200).json({
      message: 'Testimonial approved successfully',
      data: testimonial,
    });
  } catch (error: any) {
    if (error.message === 'Testimonial not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Cannot approve inactive testimonial') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const getTestimonialStatsController = async (
  _: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const stats = await getTestimonialStatsService();

    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
