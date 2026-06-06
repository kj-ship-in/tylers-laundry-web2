import cron, { ScheduledTask } from 'node-cron';

import logger from '../utils/logger';

import { ReportingService } from './reporting.service';

const CronJobService = {
  isInitialized: false,
  jobs: new Map<string, ScheduledTask>(),
  lastRuns: new Map<string, Date>(),

  /**
   * Initialize all scheduled tasks
   */
  async initializeCronJobs() {
    if (CronJobService.isInitialized) {
      logger.warn('Cron jobs already initialized');
      return;
    }

    logger.info('Initializing cron jobs...');

    // Daily report generation at 6:00 AM
    const dailyTask = cron.schedule(
      '0 6 * * *',
      async () => {
        try {
          logger.info('Running daily report generation...');
          CronJobService.lastRuns.set('daily-reports', new Date());
          await CronJobService.generateDailyReports();
          logger.info('Daily reports generated successfully');
        } catch (error) {
          logger.error('Error generating daily reports:', error);
        }
      },
      {
        timezone: 'UTC',
      },
    );

    // Weekly report generation every Monday at 7:00 AM
    const weeklyTask = cron.schedule(
      '0 7 * * 1',
      async () => {
        try {
          logger.info('Running weekly report generation...');
          CronJobService.lastRuns.set('weekly-reports', new Date());
          await CronJobService.generateWeeklyReports();
          logger.info('Weekly reports generated successfully');
        } catch (error) {
          logger.error('Error generating weekly reports:', error);
        }
      },
      {
        timezone: 'UTC',
      },
    );

    // Monthly report generation on the 1st at 8:00 AM
    const monthlyTask = cron.schedule(
      '0 8 1 * *',
      async () => {
        try {
          logger.info('Running monthly report generation...');
          CronJobService.lastRuns.set('monthly-reports', new Date());
          await CronJobService.generateMonthlyReports();
          logger.info('Monthly reports generated successfully');
        } catch (error) {
          logger.error('Error generating monthly reports:', error);
        }
      },
      {
        timezone: 'UTC',
      },
    );

    // Cleanup old data every Sunday at 2:00 AM
    const cleanupTask = cron.schedule(
      '0 2 * * 0',
      async () => {
        try {
          logger.info('Running database cleanup...');
          CronJobService.lastRuns.set('cleanup-old-data', new Date());
          await CronJobService.cleanupOldData();
          logger.info('Database cleanup completed successfully');
        } catch (error) {
          logger.error('Error during database cleanup:', error);
        }
      },
      {
        timezone: 'UTC',
      },
    );

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
    logger.info('All cron jobs initialized and started');
  },

  /**
   * Stop all scheduled tasks
   */
  async stopCronJobs() {
    if (!CronJobService.isInitialized) {
      logger.warn('Cron jobs not initialized');
      return;
    }

    logger.info('Stopping all cron jobs...');

    for (const [name, task] of CronJobService.jobs.entries()) {
      await task.stop();
      logger.info(`Stopped ${name} cron job`);
    }

    CronJobService.isInitialized = false;
    logger.info('All cron jobs stopped');
  },

  /**
   * Generate daily reports
   */
  async generateDailyReports() {
    // Generate daily financial report
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await ReportingService.generateFinancialReport({
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

    await ReportingService.generateFinancialReport({
      startDate: weekAgo.toISOString(),
      endDate: today.toISOString(),
      format: 'excel',
    });

    await ReportingService.generateCustomerReport({
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

    await ReportingService.generateFinancialReport({
      startDate: monthAgo.toISOString(),
      endDate: today.toISOString(),
      format: 'excel',
    });

    await ReportingService.generateCustomerReport({
      startDate: monthAgo.toISOString(),
      endDate: today.toISOString(),
      format: 'excel',
    });

    await ReportingService.generateServicePerformanceReport({
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
    logger.info(
      'Performing database cleanup (placeholder - implement based on requirements)',
    );

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

  getNextRunTime(jobName: string): string | null {
    const task = CronJobService.jobs.get(jobName);
    if (!task) return null;

    // node-cron doesn't provide a direct way to get next run time
    // This is a simplified implementation - in production you might want
    // to use a more sophisticated scheduling library like node-schedule
    const schedules: Record<string, string> = {
      'daily-reports': '0 6 * * *',
      'weekly-reports': '0 7 * * 1',
      'monthly-reports': '0 8 1 * *',
      'cleanup-old-data': '0 2 * * 0',
    };

    const schedule = schedules[jobName];
    if (!schedule) return null;

    // This is a basic approximation - for exact next run time,
    // consider using a library like cron-parser
    return 'Next run calculated based on cron schedule';
  },
};

// Export for use in main application
export default CronJobService;
