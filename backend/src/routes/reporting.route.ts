import express from 'express';

import {
  getAllChartsController,
  getCustomerAnalyticsController,
  getCustomerAcquisitionController,
  getDailyBookingComparisonController,
  getFinancialReportController,
  getMonthlyTrendsController,
  getPaymentMethodDonutController,
  getRevenueLineChartController,
  getServicePerformanceController,
  getServiceRevenueDonutController,
  getStaffEfficiencyController,
  getStaffPerformanceController,
  getStaffWorkloadController,
  generateScheduledReportsController,
  getCronJobStatusController,
  getDashboardStatsController,
  getBookingStatusBarChartController,
} from '../controllers/reporting.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { Permission } from '../types/enums';

const router = express.Router();

router.use(authMiddleware);

// Dashboard and analytics - require analytics view permission
router.get(
  '/dashboard',
  requirePermission(Permission.ANALYTICS_VIEW),
  getDashboardStatsController,
);
router.get(
  '/monthly-trends',
  requirePermission(Permission.ANALYTICS_VIEW),
  getMonthlyTrendsController,
);

// Detailed reports with export options - require reports view permission
router.get(
  '/financial',
  requirePermission(Permission.REPORTS_VIEW),
  getFinancialReportController,
);
router.get(
  '/customers',
  requirePermission(Permission.REPORTS_VIEW),
  getCustomerAnalyticsController,
);
router.get(
  '/services',
  requirePermission(Permission.REPORTS_VIEW),
  getServicePerformanceController,
);

// Chart data endpoints - require analytics view permission
router.get(
  '/charts/revenue-line',
  requirePermission(Permission.ANALYTICS_VIEW),
  getRevenueLineChartController,
);
router.get(
  '/charts/booking-status-bar',
  requirePermission(Permission.ANALYTICS_VIEW),
  getBookingStatusBarChartController,
);
router.get(
  '/charts/service-revenue-donut',
  requirePermission(Permission.ANALYTICS_VIEW),
  getServiceRevenueDonutController,
);
router.get(
  '/charts/payment-method-donut',
  requirePermission(Permission.ANALYTICS_VIEW),
  getPaymentMethodDonutController,
);
router.get(
  '/charts/daily-booking-comparison',
  requirePermission(Permission.ANALYTICS_VIEW),
  getDailyBookingComparisonController,
);
router.get(
  '/charts/customer-acquisition',
  requirePermission(Permission.ANALYTICS_VIEW),
  getCustomerAcquisitionController,
);
router.get(
  '/charts/all',
  requirePermission(Permission.ANALYTICS_VIEW),
  getAllChartsController,
);

// Staff performance endpoints - require staff view permission
router.get(
  '/staff/performance',
  requirePermission(Permission.STAFF_VIEW),
  getStaffPerformanceController,
);
router.get(
  '/staff/workload',
  requirePermission(Permission.STAFF_VIEW),
  getStaffWorkloadController,
);
router.get(
  '/staff/efficiency',
  requirePermission(Permission.STAFF_VIEW),
  getStaffEfficiencyController,
);

// Manual report generation - require reports generate permission
router.post(
  '/generate',
  requirePermission(Permission.REPORTS_GENERATE),
  generateScheduledReportsController,
);

// Cron job management - require admin-level permission
router.get(
  '/cron-status',
  requirePermission(Permission.SETTINGS_UPDATE),
  getCronJobStatusController,
);

export default router;
