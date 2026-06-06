"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = __importDefault(require("../utils/logger"));
const reporting_service_1 = require("./reporting.service");
const CronJobService = {
    isInitialized: false,
    jobs: new Map(),
    lastRuns: new Map(),
    /**
     * Initialize all scheduled tasks
     */
    async initializeCronJobs() {
        if (CronJobService.isInitialized) {
            logger_1.default.warn('Cron jobs already initialized');
            return;
        }
        logger_1.default.info('Initializing cron jobs...');
        // Daily report generation at 6:00 AM
        const dailyTask = node_cron_1.default.schedule('0 6 * * *', async () => {
            try {
                logger_1.default.info('Running daily report generation...');
                CronJobService.lastRuns.set('daily-reports', new Date());
                await CronJobService.generateDailyReports();
                logger_1.default.info('Daily reports generated successfully');
            }
            catch (error) {
                logger_1.default.error('Error generating daily reports:', error);
            }
        }, {
            timezone: 'UTC',
        });
        // Weekly report generation every Monday at 7:00 AM
        const weeklyTask = node_cron_1.default.schedule('0 7 * * 1', async () => {
            try {
                logger_1.default.info('Running weekly report generation...');
                CronJobService.lastRuns.set('weekly-reports', new Date());
                await CronJobService.generateWeeklyReports();
                logger_1.default.info('Weekly reports generated successfully');
            }
            catch (error) {
                logger_1.default.error('Error generating weekly reports:', error);
            }
        }, {
            timezone: 'UTC',
        });
        // Monthly report generation on the 1st at 8:00 AM
        const monthlyTask = node_cron_1.default.schedule('0 8 1 * *', async () => {
            try {
                logger_1.default.info('Running monthly report generation...');
                CronJobService.lastRuns.set('monthly-reports', new Date());
                await CronJobService.generateMonthlyReports();
                logger_1.default.info('Monthly reports generated successfully');
            }
            catch (error) {
                logger_1.default.error('Error generating monthly reports:', error);
            }
        }, {
            timezone: 'UTC',
        });
        // Cleanup old data every Sunday at 2:00 AM
        const cleanupTask = node_cron_1.default.schedule('0 2 * * 0', async () => {
            try {
                logger_1.default.info('Running database cleanup...');
                CronJobService.lastRuns.set('cleanup-old-data', new Date());
                await CronJobService.cleanupOldData();
                logger_1.default.info('Database cleanup completed successfully');
            }
            catch (error) {
                logger_1.default.error('Error during database cleanup:', error);
            }
        }, {
            timezone: 'UTC',
        });
        // Store job references
        CronJobService.jobs.set('daily-reports', dailyTask);
        CronJobService.jobs.set('weekly-reports', weeklyTask);
        CronJobService.jobs.set('monthly-reports', monthlyTask);
        CronJobService.jobs.set('cleanup-old-data', cleanupTask);
        // Start all tasks
        await dailyTask.start();
        await weeklyTask.start();
        await monthlyTask.start();
        await cleanupTask.start();
        CronJobService.isInitialized = true;
        logger_1.default.info('All cron jobs initialized and started');
    },
    /**
     * Stop all scheduled tasks
     */
    async stopCronJobs() {
        if (!CronJobService.isInitialized) {
            logger_1.default.warn('Cron jobs not initialized');
            return;
        }
        logger_1.default.info('Stopping all cron jobs...');
        for (const [name, task] of CronJobService.jobs.entries()) {
            await task.stop();
            logger_1.default.info(`Stopped ${name} cron job`);
        }
        CronJobService.isInitialized = false;
        logger_1.default.info('All cron jobs stopped');
    },
    /**
     * Generate daily reports
     */
    async generateDailyReports() {
        // Generate daily financial report
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        await reporting_service_1.ReportingService.generateFinancialReport({
            startDate: yesterday.toISOString(),
            endDate: today.toISOString(),
            format: 'excel',
        });
    },
    /**
     * Generate weekly reports
     */
    async generateWeeklyReports() {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        await reporting_service_1.ReportingService.generateFinancialReport({
            startDate: weekAgo.toISOString(),
            endDate: today.toISOString(),
            format: 'excel',
        });
        await reporting_service_1.ReportingService.generateCustomerReport({
            startDate: weekAgo.toISOString(),
            endDate: today.toISOString(),
            format: 'excel',
        });
    },
    /**
     * Generate monthly reports
     */
    async generateMonthlyReports() {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        await reporting_service_1.ReportingService.generateFinancialReport({
            startDate: monthAgo.toISOString(),
            endDate: today.toISOString(),
            format: 'excel',
        });
        await reporting_service_1.ReportingService.generateCustomerReport({
            startDate: monthAgo.toISOString(),
            endDate: today.toISOString(),
            format: 'excel',
        });
        await reporting_service_1.ReportingService.generateServicePerformanceReport({
            startDate: monthAgo.toISOString(),
            endDate: today.toISOString(),
            format: 'excel',
        });
    },
    /**
     * Cleanup old data
     */
    async cleanupOldData() {
        // This would typically clean up old logs, temporary files, etc.
        // For now, just log the action
        logger_1.default.info('Performing database cleanup (placeholder - implement based on requirements)');
        // Example cleanup operations:
        // - Delete old log files
        // - Archive old completed bookings
        // - Clean up temporary upload files
        // - Remove expired verification codes
    },
    /**
     * Get status of all cron jobs
     */
    async getJobsStatus() {
        const status = [];
        for (const name of CronJobService.jobs.keys()) {
            status.push({
                name,
                running: CronJobService.isInitialized,
                lastRun: CronJobService.lastRuns.get(name) ?? null,
                nextRun: CronJobService.getNextRunTime(name),
            });
        }
        return status;
    },
    getNextRunTime(jobName) {
        const task = CronJobService.jobs.get(jobName);
        if (!task)
            return null;
        // node-cron doesn't provide a direct way to get next run time
        // This is a simplified implementation - in production you might want
        // to use a more sophisticated scheduling library like node-schedule
        const schedules = {
            'daily-reports': '0 6 * * *',
            'weekly-reports': '0 7 * * 1',
            'monthly-reports': '0 8 1 * *',
            'cleanup-old-data': '0 2 * * 0',
        };
        const schedule = schedules[jobName];
        if (!schedule)
            return null;
        // This is a basic approximation - for exact next run time,
        // consider using a library like cron-parser
        return 'Next run calculated based on cron schedule';
    },
};
// Export for use in main application
exports.default = CronJobService;
