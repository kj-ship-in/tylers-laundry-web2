import express from 'express';
import { createServiceController, getAllServicesController, getServiceByIdController, updateServiceController, deleteServiceController, getPublicServicesController, getServiceOverviewController, } from '../controllers/service.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { Permission } from '../types/enums';
const router = express.Router();
// Public routes - no authentication required
router.get('/', getPublicServicesController);
// Authenticated routes - require authentication
router.use(authMiddleware);
// Staff/Admin routes - require specific permissions
router.get('/overview/stats', requirePermission(Permission.ANALYTICS_VIEW), getServiceOverviewController);
router.get('/getAll', requirePermission(Permission.SERVICE_VIEW), getAllServicesController);
router.post('/create', requirePermission(Permission.SERVICE_CREATE), createServiceController);
router.get('/get/:id', requirePermission(Permission.SERVICE_VIEW), getServiceByIdController);
router.put('/update/:id', requirePermission(Permission.SERVICE_UPDATE), updateServiceController);
router.delete('/delete/:id', requirePermission(Permission.SERVICE_DELETE), deleteServiceController);
export default router;
