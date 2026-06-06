"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const mongoose_1 = require("./lib/mongoose");
const cron_service_1 = __importDefault(require("./services/cron.service"));
const logger_1 = __importDefault(require("./utils/logger"));
const PORT = env_1.env.PORT ?? 3000;
(0, mongoose_1.connectDB)().catch(err => {
    logger_1.default.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});
const server = app_1.default.listen(PORT, () => {
    logger_1.default.info(`🚀 Server running on http://localhost:${PORT}`);
    // Initialize cron jobs only in production or when explicitly enabled
    if (env_1.env.NODE_ENV === 'production' || env_1.env.ENABLE_CRON_JOBS === 'true') {
        logger_1.default.info('Initializing scheduled tasks...');
        void cron_service_1.default.initializeCronJobs();
    }
    else {
        logger_1.default.info('Cron jobs disabled (set ENABLE_CRON_JOBS=true to enable)');
    }
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    void cron_service_1.default.stopCronJobs();
    server.close(() => {
        logger_1.default.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT received, shutting down gracefully');
    void cron_service_1.default.stopCronJobs();
    server.close(() => {
        logger_1.default.info('Process terminated');
        process.exit(0);
    });
});
exports.default = server;
