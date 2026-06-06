import { Router } from 'express';
import { getCustomerDashboardStatsController, getCustomerRecentBookingsController, getCustomerUpcomingBookingsController, } from '../controllers/customer.dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
const router = Router();
router.use(authMiddleware);
/**
 * GET /api/v1/dashboard/stats
 * Retrieves customer dashboard statistics: total bookings, total spent, pending payments, active bookings
 */
router.get('/customer/stats', getCustomerDashboardStatsController);
/**
 * GET /api/v1/dashboard/recent-bookings?limit=5
 * Retrieves customer's recent bookings with optional limit (default: 5, max: 12)
 */
router.get('/customer/recent-bookings', getCustomerRecentBookingsController);
/**
 * GET /api/v1/dashboard/upcoming-bookings?limit=5
 * Retrieves customer's upcoming bookings with optional limit (default: 5, max: 12)
 */
router.get('/customer/upcoming-bookings', getCustomerUpcomingBookingsController);
export const customerDashboardRoutes = router;
