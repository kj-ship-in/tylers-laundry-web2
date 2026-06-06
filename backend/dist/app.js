"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middlewares/error.middleware");
const request_logger_middleware_1 = require("./middlewares/request-logger.middleware");
const security_middleware_1 = require("./middlewares/security.middleware");
const routes_1 = require("./routes");
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, compression_1.default)({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
}));
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
}));
app.use(security_middleware_1.xssProtection);
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
}));
if (env_1.env.NODE_ENV === 'development') {
    app.use(request_logger_middleware_1.requestLogger);
}
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/v1/', limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api/v1/auth', routes_1.authRoutes);
app.use('/api/v1/user', routes_1.userRoutes);
app.use('/api/v1/security', routes_1.userSecurityRoutes);
app.use('/api/v1/services', routes_1.serviceRoutes);
app.use('/api/v1/testimonials', routes_1.testimonialRoutes);
app.use('/api/v1/bookings', routes_1.bookingRoutes);
app.use('/api/v1/payments', routes_1.paymentRoutes);
app.use('/api/v1/invoices', routes_1.invoiceRoutes);
app.use('/api/v1/receipts', routes_1.receiptRoutes);
app.use('/api/v1/reports', routes_1.reportingRoutes);
app.use('/api/v1/admin', routes_1.adminRoutes);
app.use('/api/v1/admin/dashboard', routes_1.dashboardRoutes);
app.use('/api/v1/staff/dashboard', routes_1.staffDashboardRoutes);
app.use('/api/v1/dashboard', routes_1.customerDashboardRoutes);
app.use('/api/v1/roles', routes_1.roleRoutes);
app.get('/health', async (_, res) => {
    try {
        const healthCheck = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: env_1.env.NODE_ENV,
            version: process.env.npm_package_version ?? '1.0.0',
        };
        res.status(200).json(healthCheck);
    }
    catch (_error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
        });
    }
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
