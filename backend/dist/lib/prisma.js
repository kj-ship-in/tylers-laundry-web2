import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../prisma/generated/prisma';
const globalForPrisma = globalThis;
const pool = globalForPrisma.pool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool;
}
const adapter = new PrismaPg(pool);
// ✅ Remove datasourceUrl - adapter handles the connection
export const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        adapter, // The adapter already has the DATABASE_URL from the Pool
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
        errorFormat: 'pretty',
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
const cleanup = async () => {
    try {
        await prisma.$disconnect();
        await pool.end();
    }
    catch (error) {
        console.error('Error during cleanup:', error);
    }
};
process.on('beforeExit', () => {
    void cleanup();
});
process.on('SIGINT', () => {
    void cleanup().then(() => process.exit(0));
});
process.on('SIGTERM', () => {
    void cleanup().then(() => process.exit(0));
});
export default prisma;
