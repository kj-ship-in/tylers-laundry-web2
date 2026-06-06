import { Router } from 'express';
import { getDashboardStatsController, getRecentBookingsController, getDailyOverviewController, } from '../controllers/admin.dashboard.controller';
import { authMiddleware, requireAdmin } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { Permission } from '../types/enums';
const router = Router();
router.use(authMiddleware, requireAdmin);
/**
 * GET /api/v1/admin/dashboard/stats
 * Retrieves dashboard statistics: total revenue, active bookings, total customers, pending payments
 */
router.get('/stats', requirePermission(Permission.ANALYTICS_VIEW), getDashboardStatsController);
/**
 * GET /api/v1/admin/dashboard/recent-bookings?limit=10
 * Retrieves recent bookings with optional limit (default: 10, max: 100)
 */
router.get('/recent-bookings', requirePermission(Permission.BOOKING_VIEW_ALL), getRecentBookingsController);
/**
 * GET /api/v1/admin/dashboard/daily-overview
 * Retrieves today's overview: new bookings, completed, in progress, revenue
 */
router.get('/daily-overview', requirePermission(Permission.ANALYTICS_VIEW), getDailyOverviewController);
export const dashboardRoutes = router;
