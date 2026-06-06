import express from 'express';
import { createTestimonialController, getAllTestimonialsController, getTestimonialByIdController, getUserTestimonialsController, updateTestimonialController, deleteTestimonialController, approveTestimonialController, getTestimonialStatsController, getAllAdminTestimonialsController, } from '../controllers/testimonial.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { validateBody, validateParams, validateQuery, } from '../middlewares/validate';
import { Permission } from '../prisma/generated/prisma';
import { CreateTestimonialSchema, UpdateTestimonialSchema, GetTestimonialsQuerySchema, TestimonialIdSchema, } from '../validators/testimonial.schema';
const router = express.Router();
// Public routes - no authentication required
router.get('/', validateQuery(GetTestimonialsQuerySchema), getAllTestimonialsController);
router.use(authMiddleware);
// User routes - any authenticated user
router.post('/create', validateBody(CreateTestimonialSchema), requirePermission(Permission.TESTIMONIAL_CREATE), createTestimonialController);
router.get('/user/me', requirePermission(Permission.TESTIMONIAL_VIEW), getUserTestimonialsController);
// Admin routes - require specific permissions
router.get('/admin/stats', requirePermission(Permission.ANALYTICS_VIEW), getTestimonialStatsController);
router.get('/admin/getAll', requirePermission(Permission.TESTIMONIAL_VIEW), validateQuery(GetTestimonialsQuerySchema), getAllAdminTestimonialsController);
router.put('/:id/approve', validateParams(TestimonialIdSchema), requirePermission(Permission.TESTIMONIAL_MANAGE), approveTestimonialController);
router.get('/get/:id', validateParams(TestimonialIdSchema), requirePermission(Permission.TESTIMONIAL_VIEW), getTestimonialByIdController);
router.put('/update/:id', validateParams(TestimonialIdSchema), validateBody(UpdateTestimonialSchema), requirePermission(Permission.TESTIMONIAL_UPDATE), updateTestimonialController);
router.delete('/delete/:id', validateParams(TestimonialIdSchema), requirePermission(Permission.TESTIMONIAL_DELETE), deleteTestimonialController);
export default router;
