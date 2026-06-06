/* eslint-disable no-console */
import dotenv from 'dotenv';

dotenv.config();

import prisma from './src/lib/prisma';

async function checkDatabase() {
  console.log('Checking database contents...');

  try {
    // First, just check if we can connect
    const userCount = await prisma.user.count();
    console.log('✅ Database connection successful. Users count:', userCount);

    // Check receipts
    const receipts = await prisma.receipt.findMany({
      include: {
        invoice: {
          include: {
            payment: {
              include: {
                booking: {
                  include: {
                    user: true,
                    service: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log('Receipts found:', receipts.length);
    if (receipts.length > 0) {
      console.log('First receipt:', JSON.stringify(receipts[0], null, 2));

      // Test flattening
      const flattened = {
        ...receipts[0],
        payment: receipts[0].invoice?.payment ?? null,
        booking: receipts[0].invoice?.payment?.booking ?? null,
        user: receipts[0].invoice?.payment?.booking?.user ?? null,
        service: receipts[0].invoice?.payment?.booking?.service ?? null,
      };

      console.log('Flattened receipt:', JSON.stringify(flattened, null, 2));
      console.log('User name:', flattened.user?.name);
      console.log('Service title:', flattened.service?.title);
      console.log('Payment amount:', flattened.payment?.amount);
    }

    // Check users
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);

    // Check services
    const services = await prisma.service.findMany();
    console.log('Services found:', services.length);
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
