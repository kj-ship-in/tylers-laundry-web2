"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reporting_controller_1 = require("../controllers/reporting.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const enums_1 = require("../types/enums");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
// Dashboard and analytics - require analytics view permission
router.get('/dashboard', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), reporting_controller_1.getDashboardStatsController);
router.get('/monthly-trends', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), reporting_controller_1.getMonthlyTrendsController);
// Detailed reports with export options - require reports view permission
router.get('/financial', (0, permission_middleware_1.requirePermission)(enums_1.Permission.REPORTS_VIEW), reporting_controller_1.getFinancialReportController);
router.get('/customers', (0, permission_middleware_1.requirePermission)(enums_1.Permission.REPORTS_VIEW), reporting_controller_1.getCustomerAnalyticsController);
router.get('/services', (0, permission_middleware_1.requirePermission)(enums_1.Permission.REPORTS_VIEW), reporting_controller_1.getServicePerformanceController);
// Chart data endpoints - require analytics view permission
router.get('/charts/revenue-line', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), reporting_controller_1.getRevenueLineChartController);
router.get('/charts/booking-status-bar', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), reporting_controller_1.getBookingStatusBarChartController);
router.get('/charts/service-revenue-donut', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), reporting_controller_1.getServiceRevenueDonutController);
router.get('/charts/payment-method-donut', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), reporting_controller_1.getPaymentMethodDonutController);
router.get('/charts/daily-booking-comparison', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), reporting_controller_1.getDailyBookingComparisonController);
router.get('/charts/customer-acquisition', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), reporting_controller_1.getCustomerAcquisitionController);
router.get('/charts/all', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), reporting_controller_1.getAllChartsController);
// Staff performance endpoints - require staff view permission
router.get('/staff/performance', (0, permission_middleware_1.requirePermission)(enums_1.Permission.STAFF_VIEW), reporting_controller_1.getStaffPerformanceController);
router.get('/staff/workload', (0, permission_middleware_1.requirePermission)(enums_1.Permission.STAFF_VIEW), reporting_controller_1.getStaffWorkloadController);
router.get('/staff/efficiency', (0, permission_middleware_1.requirePermission)(enums_1.Permission.STAFF_VIEW), reporting_controller_1.getStaffEfficiencyController);
// Manual report generation - require reports generate permission
router.post('/generate', (0, permission_middleware_1.requirePermission)(enums_1.Permission.REPORTS_GENERATE), reporting_controller_1.generateScheduledReportsController);
// Cron job management - require admin-level permission
router.get('/cron-status', (0, permission_middleware_1.requirePermission)(enums_1.Permission.SETTINGS_UPDATE), reporting_controller_1.getCronJobStatusController);
exports.default = router;
