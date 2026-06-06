import express from 'express';
import { getDashboardDataController, getBookingReportsController, deleteStaffController, updateUserStatusController, deleteCustomerController, getAllPermissionsController, } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { Permission } from '../types/enums';
const router = express.Router();
router.use(authMiddleware);
// Dashboard and analytics routes
router.get('/dashboard', requirePermission(Permission.ANALYTICS_VIEW), getDashboardDataController);
router.get('/reports/bookings', requirePermission(Permission.REPORTS_VIEW), getBookingReportsController);
// User management routes
router.delete('/staff/:id', requirePermission(Permission.STAFF_DELETE), deleteStaffController);
router.delete('/customers/:id', requirePermission(Permission.USER_DELETE), deleteCustomerController);
router.patch('/users/:id/status', requirePermission(Permission.USER_UPDATE), updateUserStatusController);
router.get('/permissions', requirePermission(Permission.PERMISSION_ASSIGN), getAllPermissionsController);
export default router;
