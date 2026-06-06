import CronJobService from '../services/cron.service';
import { ReportingService } from '../services/reporting.service';
export const getDashboardStatsController = async (_, res, next) => {
    try {
        const stats = await ReportingService.getDashboardStats();
        res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
};
export const getFinancialReportController = async (req, res, next) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const format = req.query.format || 'json';
        const result = await ReportingService.generateFinancialReport({
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
export const getCustomerAnalyticsController = async (req, res, next) => {
    try {
        const format = req.query.format || 'json';
        const result = await ReportingService.generateCustomerReport({ format });
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
export const getServicePerformanceController = async (req, res, next) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const format = req.query.format || 'json';
        const result = await ReportingService.generateServicePerformanceReport({
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
export const getMonthlyTrendsController = async (_, res, next) => {
    try {
        const trends = await ReportingService.getMonthlyTrends();
        res.status(200).json({
            message: 'Monthly trends report generated successfully',
            data: trends,
        });
    }
    catch (error) {
        next(error);
    }
};
export const generateScheduledReportsController = async (_, res, next) => {
    try {
        // For now, we'll manually trigger the main reports
        const dashboardStats = await ReportingService.getDashboardStats();
        const monthlyTrends = await ReportingService.getMonthlyTrends();
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
export const getCronJobStatusController = async (_req, res, next) => {
    try {
        const status = CronJobService.getJobsStatus();
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
export const getRevenueLineChartController = async (req, res, next) => {
    try {
        const days = req.query.days ? Number(req.query.days) : 30;
        if (isNaN(days) || days < 1 || days > 365) {
            return res.status(400).json({
                message: 'Invalid days parameter. Must be a number between 1 and 365.',
            });
        }
        const chartData = await ReportingService.getRevenueLineChartData(days);
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
export const getBookingStatusBarChartController = async (_req, res, next) => {
    try {
        const chartData = await ReportingService.getBookingStatusBarChartData();
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
export const getServiceRevenueDonutController = async (_req, res, next) => {
    try {
        const chartData = await ReportingService.getServiceRevenueDonutData();
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
export const getPaymentMethodDonutController = async (_req, res, next) => {
    try {
        const chartData = await ReportingService.getPaymentMethodDonutData();
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
export const getDailyBookingComparisonController = async (req, res, next) => {
    try {
        const days = req.query.days ? Number(req.query.days) : 30;
        if (isNaN(days) || days < 1 || days > 365) {
            return res.status(400).json({
                message: 'Invalid days parameter. Must be a number between 1 and 365.',
            });
        }
        const chartData = await ReportingService.getDailyBookingComparisonData(days);
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
export const getCustomerAcquisitionController = async (req, res, next) => {
    try {
        const months = req.query.months ? Number(req.query.months) : 12;
        if (isNaN(months) || months < 1 || months > 60) {
            return res.status(400).json({
                message: 'Invalid months parameter. Must be a number between 1 and 60.',
            });
        }
        const chartData = await ReportingService.getCustomerAcquisitionLineData(months);
        return res.status(200).json(chartData);
    }
    catch (error) {
        next(error);
    }
};
export const getAllChartsController = async (_req, res, next) => {
    try {
        const allCharts = await ReportingService.getAllChartData();
        return res.status(200).json(allCharts);
    }
    catch (error) {
        next(error);
    }
};
export const getStaffPerformanceController = async (_req, res, next) => {
    try {
        const staffPerformance = await ReportingService.getStaffPerformanceMetrics();
        return res.status(200).json({
            message: 'Staff performance metrics retrieved successfully',
            data: staffPerformance,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getStaffWorkloadController = async (_req, res, next) => {
    try {
        const workloadData = await ReportingService.getStaffWorkloadDistribution();
        return res.status(200).json({
            message: 'Staff workload distribution retrieved successfully',
            data: workloadData,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getStaffEfficiencyController = async (req, res, next) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const efficiencyData = await ReportingService.getStaffEfficiencyReport(startDate, endDate);
        return res.status(200).json({
            message: 'Staff efficiency report generated successfully',
            data: efficiencyData,
        });
    }
    catch (error) {
        next(error);
    }
};
