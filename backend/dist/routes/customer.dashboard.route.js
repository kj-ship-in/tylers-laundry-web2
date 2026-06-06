"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerDashboardRoutes = void 0;
const express_1 = require("express");
const customer_dashboard_controller_1 = require("../controllers/customer.dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
/**
 * GET /api/v1/dashboard/stats
 * Retrieves customer dashboard statistics: total bookings, total spent, pending payments, active bookings
 */
router.get('/customer/stats', customer_dashboard_controller_1.getCustomerDashboardStatsController);
/**
 * GET /api/v1/dashboard/recent-bookings?limit=5
 * Retrieves customer's recent bookings with optional limit (default: 5, max: 12)
 */
router.get('/customer/recent-bookings', customer_dashboard_controller_1.getCustomerRecentBookingsController);
/**
 * GET /api/v1/dashboard/upcoming-bookings?limit=5
 * Retrieves customer's upcoming bookings with optional limit (default: 5, max: 12)
 */
router.get('/customer/upcoming-bookings', customer_dashboard_controller_1.getCustomerUpcomingBookingsController);
exports.customerDashboardRoutes = router;
