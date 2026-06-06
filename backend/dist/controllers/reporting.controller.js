"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffEfficiencyController = exports.getStaffWorkloadController = exports.getStaffPerformanceController = exports.getAllChartsController = exports.getCustomerAcquisitionController = exports.getDailyBookingComparisonController = exports.getPaymentMethodDonutController = exports.getServiceRevenueDonutController = exports.getBookingStatusBarChartController = exports.getRevenueLineChartController = exports.getCronJobStatusController = exports.generateScheduledReportsController = exports.getMonthlyTrendsController = exports.getServicePerformanceController = exports.getCustomerAnalyticsController = exports.getFinancialReportController = exports.getDashboardStatsController = void 0;
const cron_service_1 = __importDefault(require("../services/cron.service"));
const reporting_service_1 = require("../services/reporting.service");
const getDashboardStatsController = async (_, res, next) => {
    try {
        const stats = await reporting_service_1.ReportingService.getDashboardStats();
        res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStatsController = getDashboardStatsController;
const getFinancialReportController = async (req, res, next) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const format = req.query.format || 'json';
        const result = await reporting_service_1.ReportingService.generateFinancialReport({
            startDate,
            endDate,
            format,
        });
        if (result.format === 'excel') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.send(result.buffer);
        }
        else {
            res.status(200).json({
                message: 'Financial report generated successfully',
                data: result.data,
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getFinancialReportController = getFinancialReportController;
const getCustomerAnalyticsController = async (req, res, next) => {
    try {
        const format = req.query.format || 'json';
        const result = await reporting_service_1.ReportingService.generateCustomerReport({ format });
        if (result.format === 'excel') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.send(result.buffer);
        }
        else {
            res.status(200).json({
                message: 'Customer analytics generated successfully',
                data: result.data,
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerAnalyticsController = getCustomerAnalyticsController;
const getServicePerformanceController = async (req, res, next) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const format = req.query.format || 'json';
        const result = await reporting_service_1.ReportingService.generateServicePerformanceReport({
            startDate,
            endDate,
            format,
        });
        if (result.format === 'excel') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.send(result.buffer);
        }
        else {
            res.status(200).json({
                message: 'Service performance report generated successfully',
                data: result.data,
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getServicePerformanceController = getServicePerformanceController;
const getMonthlyTrendsController = async (_, res, next) => {
    try {
        const trends = await reporting_service_1.ReportingService.getMonthlyTrends();
        res.status(200).json({
            message: 'Monthly trends report generated successfully',
            data: trends,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMonthlyTrendsController = getMonthlyTrendsController;
const generateScheduledReportsController = async (_, res, next) => {
    try {
        // For now, we'll manually trigger the main reports
        const dashboardStats = await reporting_service_1.ReportingService.getDashboardStats();
        const monthlyTrends = await reporting_service_1.ReportingService.getMonthlyTrends();
        res.status(200).json({
            message: 'Reports generated successfully',
            data: {
                dashboardStats,
                monthlyTrends,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateScheduledReportsController = generateScheduledReportsController;
const getCronJobStatusController = async (_req, res, next) => {
    try {
        const status = cron_service_1.default.getJobsStatus();
        return res.status(200).json({
            success: true,
            data: {
                enabled: process.env.ENABLE_CRON_JOBS === 'true',
                jobs: status,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCronJobStatusController = getCronJobStatusController;
const getRevenueLineChartController = async (req, res, next) => {
    try {
        const days = req.query.days ? Number(req.query.days) : 30;
        if (isNaN(days) || days < 1 || days > 365) {
            return res.status(400).json({
                message: 'Invalid days parameter. Must be a number between 1 and 365.',
            });
        }
        const chartData = await reporting_service_1.ReportingService.getRevenueLineChartData(days);
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
exports.getRevenueLineChartController = getRevenueLineChartController;
const getBookingStatusBarChartController = async (_req, res, next) => {
    try {
        const chartData = await reporting_service_1.ReportingService.getBookingStatusBarChartData();
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingStatusBarChartController = getBookingStatusBarChartController;
const getServiceRevenueDonutController = async (_req, res, next) => {
    try {
        const chartData = await reporting_service_1.ReportingService.getServiceRevenueDonutData();
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
exports.getServiceRevenueDonutController = getServiceRevenueDonutController;
const getPaymentMethodDonutController = async (_req, res, next) => {
    try {
        const chartData = await reporting_service_1.ReportingService.getPaymentMethodDonutData();
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentMethodDonutController = getPaymentMethodDonutController;
const getDailyBookingComparisonController = async (req, res, next) => {
    try {
        const days = req.query.days ? Number(req.query.days) : 30;
        if (isNaN(days) || days < 1 || days > 365) {
            return res.status(400).json({
                message: 'Invalid days parameter. Must be a number between 1 and 365.',
            });
        }
        const chartData = await reporting_service_1.ReportingService.getDailyBookingComparisonData(days);
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
exports.getDailyBookingComparisonController = getDailyBookingComparisonController;
const getCustomerAcquisitionController = async (req, res, next) => {
    try {
        const months = req.query.months ? Number(req.query.months) : 12;
        if (isNaN(months) || months < 1 || months > 60) {
            return res.status(400).json({
                message: 'Invalid months parameter. Must be a number between 1 and 60.',
            });
        }
        const chartData = await reporting_service_1.ReportingService.getCustomerAcquisitionLineData(months);
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerAcquisitionController = getCustomerAcquisitionController;
const getAllChartsController = async (_req, res, next) => {
    try {
        const allCharts = await reporting_service_1.ReportingService.getAllChartData();
        return res.status(200).json(allCharts);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllChartsController = getAllChartsController;
const getStaffPerformanceController = async (_req, res, next) => {
    try {
        const staffPerformance = await reporting_service_1.ReportingService.getStaffPerformanceMetrics();
        return res.status(200).json({
            message: 'Staff performance metrics retrieved successfully',
            data: staffPerformance,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStaffPerformanceController = getStaffPerformanceController;
const getStaffWorkloadController = async (_req, res, next) => {
    try {
        const workloadData = await reporting_service_1.ReportingService.getStaffWorkloadDistribution();
        return res.status(200).json({
            message: 'Staff workload distribution retrieved successfully',
            data: workloadData,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStaffWorkloadController = getStaffWorkloadController;
const getStaffEfficiencyController = async (req, res, next) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const efficiencyData = await reporting_service_1.ReportingService.getStaffEfficiencyReport(startDate, endDate);
        return res.status(200).json({
            message: 'Staff efficiency report generated successfully',
            data: efficiencyData,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStaffEfficiencyController = getStaffEfficiencyController;
