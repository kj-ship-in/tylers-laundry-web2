"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const testimonial_controller_1 = require("../controllers/testimonial.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const validate_1 = require("../middlewares/validate");
const enums_1 = require("../types/enums");
const testimonial_schema_1 = require("../validators/testimonial.schema");
const router = express_1.default.Router();
// Public routes - no authentication required
router.get('/', (0, validate_1.validateQuery)(testimonial_schema_1.GetTestimonialsQuerySchema), testimonial_controller_1.getAllTestimonialsController);
router.use(auth_middleware_1.authMiddleware);
// User routes - any authenticated user
router.post('/create', (0, validate_1.validateBody)(testimonial_schema_1.CreateTestimonialSchema), (0, permission_middleware_1.requirePermission)(enums_1.Permission.TESTIMONIAL_CREATE), testimonial_controller_1.createTestimonialController);
router.get('/user/me', (0, permission_middleware_1.requirePermission)(enums_1.Permission.TESTIMONIAL_VIEW), testimonial_controller_1.getUserTestimonialsController);
// Admin routes - require specific permissions
router.get('/admin/stats', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), testimonial_controller_1.getTestimonialStatsController);
router.get('/admin/getAll', (0, permission_middleware_1.requirePermission)(enums_1.Permission.TESTIMONIAL_VIEW), (0, validate_1.validateQuery)(testimonial_schema_1.GetTestimonialsQuerySchema), testimonial_controller_1.getAllAdminTestimonialsController);
router.put('/:id/approve', (0, validate_1.validateParams)(testimonial_schema_1.TestimonialIdSchema), (0, permission_middleware_1.requirePermission)(enums_1.Permission.TESTIMONIAL_MANAGE), testimonial_controller_1.approveTestimonialController);
router.get('/get/:id', (0, validate_1.validateParams)(testimonial_schema_1.TestimonialIdSchema), (0, permission_middleware_1.requirePermission)(enums_1.Permission.TESTIMONIAL_VIEW), testimonial_controller_1.getTestimonialByIdController);
router.put('/update/:id', (0, validate_1.validateParams)(testimonial_schema_1.TestimonialIdSchema), (0, validate_1.validateBody)(testimonial_schema_1.UpdateTestimonialSchema), (0, permission_middleware_1.requirePermission)(enums_1.Permission.TESTIMONIAL_UPDATE), testimonial_controller_1.updateTestimonialController);
router.delete('/delete/:id', (0, validate_1.validateParams)(testimonial_schema_1.TestimonialIdSchema), (0, permission_middleware_1.requirePermission)(enums_1.Permission.TESTIMONIAL_DELETE), testimonial_controller_1.deleteTestimonialController);
exports.default = router;
