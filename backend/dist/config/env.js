"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: zod_1.z
        .string()
        .transform(Number)
        .pipe(zod_1.z.number().min(1).max(65535))
        .default(3000),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: zod_1.z
        .string()
        .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
        .optional(),
    JWT_EXPIRES_IN: zod_1.z.string().default('1h'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    MONGODB_URI: zod_1.z.string().min(1, 'MONGODB_URI is required'),
    FRONTEND_URL: zod_1.z.url().default('http://localhost:3000'),
    ENABLE_CRON_JOBS: zod_1.z.string().default('false'),
    CLOUDINARY_NAME: zod_1.z.string().optional(),
    CLOUDINARY_KEY: zod_1.z.string().optional(),
    CLOUDINARY_SECRET: zod_1.z.string().optional(),
    EMAIL_HOST: zod_1.z.string().optional(),
    EMAIL_PORT: zod_1.z.string().transform(Number).pipe(zod_1.z.number()).optional(),
    EMAIL_USER: zod_1.z.string().optional(),
    EMAIL_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.email().optional(),
    REDIS_URL: zod_1.z.url().optional(),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
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
            EMAIL_HOST: process.env.EMAIL_HOST,
            EMAIL_PORT: process.env.EMAIL_PORT,
            EMAIL_USER: process.env.EMAIL_USER,
            EMAIL_PASS: process.env.EMAIL_PASS,
            EMAIL_FROM: process.env.EMAIL_FROM,
            REDIS_URL: process.env.REDIS_URL,
            LOG_LEVEL: process.env.LOG_LEVEL,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const missingVars = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
            console.error('Environment validation failed:', missingVars);
            process.exit(1);
        }
        throw error;
    }
};
exports.env = validateEnv();
