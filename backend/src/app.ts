import path from 'path';

import compression from 'compression';
import cors from 'cors';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/request-logger.middleware';
import { xssProtection } from './middlewares/security.middleware';
import {
  adminRoutes,
  authRoutes,
  bookingRoutes,
  customerDashboardRoutes,
  dashboardRoutes,
  invoiceRoutes,
  paymentRoutes,
  receiptRoutes,
  reportingRoutes,
  roleRoutes,
  serviceRoutes,
  staffDashboardRoutes,
  testimonialRoutes,
  userRoutes,
  userSecurityRoutes,
} from './routes';

const app = express();

app.set('trust proxy', 1);

app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

app.use(xssProtection);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

if (env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/security', userSecurityRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/testimonials', testimonialRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/receipts', receiptRoutes);
app.use('/api/v1/reports', reportingRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);
app.use('/api/v1/staff/dashboard', staffDashboardRoutes);
app.use('/api/v1/dashboard', customerDashboardRoutes);
app.use('/api/v1/roles', roleRoutes);

app.get('/health', async (_: Request, res: Response) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version ?? '1.0.0',
    };

    res.status(200).json(healthCheck);
  } catch (_error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

app.use(errorHandler);

export default app;
