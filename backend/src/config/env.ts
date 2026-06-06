import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .default(3000),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .optional(),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  FRONTEND_URL: z.url().default('https://tylers-laundry-app.netlify.app'),
  ENABLE_CRON_JOBS: z.string().default('false'),
  CLOUDINARY_NAME: z.string().optional(),
  CLOUDINARY_KEY: z.string().optional(),
  CLOUDINARY_SECRET: z.string().optional(),
  EMAIL_FROM: z.email().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  EMAIL_FROM_NAME: z.string().optional(),
  REDIS_URL: z.url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

const validateEnv = () => {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
      MONGODB_URI: process.env.MONGODB_URI,
      FRONTEND_URL: process.env.FRONTEND_URL,
      ENABLE_CRON_JOBS: process.env.ENABLE_CRON_JOBS,
      CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
      CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
      CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
      EMAIL_FROM: process.env.EMAIL_FROM,
      REDIS_URL: process.env.REDIS_URL,
      LOG_LEVEL: process.env.LOG_LEVEL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(
        (err: z.core.$ZodIssue) => `${err.path.join('.')}: ${err.message}`,
      );
      console.error('Environment validation failed:', missingVars);
      process.exit(1);
    }
    throw error;
  }
};

export const env = validateEnv();

export type Env = typeof env;
