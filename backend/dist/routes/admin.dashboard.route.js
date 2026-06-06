"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = require("express");
const admin_dashboard_controller_1 = require("../controllers/admin.dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const enums_1 = require("../types/enums");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin);
/**
 * GET /api/v1/admin/dashboard/stats
 * Retrieves dashboard statistics: total revenue, active bookings, total customers, pending payments
 */
router.get('/stats', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), admin_dashboard_controller_1.getDashboardStatsController);
/**
 * GET /api/v1/admin/dashboard/recent-bookings?limit=10
 * Retrieves recent bookings with optional limit (default: 10, max: 100)
 */
router.get('/recent-bookings', (0, permission_middleware_1.requirePermission)(enums_1.Permission.BOOKING_VIEW_ALL), admin_dashboard_controller_1.getRecentBookingsController);
/**
 * GET /api/v1/admin/dashboard/daily-overview
 * Retrieves today's overview: new bookings, completed, in progress, revenue
 */
router.get('/daily-overview', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), admin_dashboard_controller_1.getDailyOverviewController);
exports.dashboardRoutes = router;
