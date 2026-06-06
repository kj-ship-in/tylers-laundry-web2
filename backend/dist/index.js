import app from './app';
import { env } from './config/env';
import { connectDB } from './lib/mongoose';
import CronJobService from './services/cron.service';
import logger from './utils/logger';
const PORT = env.PORT ?? 3000;
connectDB().catch(err => {
    logger.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});
const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    // Initialize cron jobs only in production or when explicitly enabled
    if (env.NODE_ENV === 'production' || env.ENABLE_CRON_JOBS === 'true') {
        logger.info('Initializing scheduled tasks...');
        void CronJobService.initializeCronJobs();
    }
    else {
        logger.info('Cron jobs disabled (set ENABLE_CRON_JOBS=true to enable)');
    }
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    void CronJobService.stopCronJobs();
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    void CronJobService.stopCronJobs();
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});
export default server;
