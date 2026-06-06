import { Router } from 'express';
import { getStaffDashboardStatsController, getStaffRecentBookingsController, getStaffDailyOverviewController, } from '../controllers/staff.dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { Permission } from '../types/enums';
const router = Router();
router.use(authMiddleware);
/**
 * GET /api/v1/staff/dashboard/stats
 * Retrieves staff dashboard statistics: total revenue, active bookings, total customers, pending payments
 */
router.get('/stats', requirePermission(Permission.ANALYTICS_VIEW), getStaffDashboardStatsController);
/**
 * GET /api/v1/staff/dashboard/recent-bookings?limit=10
 * Retrieves recent bookings with optional limit (default: 10, max: 100)
 */
router.get('/recent-bookings', requirePermission(Permission.BOOKING_VIEW_ALL), getStaffRecentBookingsController);
/**
 * GET /api/v1/staff/dashboard/daily-overview
 * Retrieves today's overview: new bookings, completed, in progress, revenue
 */
router.get('/daily-overview', requirePermission(Permission.ANALYTICS_VIEW), getStaffDailyOverviewController);
export const staffDashboardRoutes = router;
