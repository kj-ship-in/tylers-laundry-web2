/* eslint-disable no-console */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { clearBookings, seedBookings } from './seeds/booking.seeder';
import { clearInvoices, seedInvoices } from './seeds/invoice.seeder';
import { clearPayments, seedPayments } from './seeds/payment.seeder';
import { clearReceipts, seedReceipts } from './seeds/receipt.seeder';
import { clearRoles, seedRoles } from './seeds/role.seeder';
import { clearServices, seedServices } from './seeds/service.seeder';
import {
  clearTestimonials,
  seedTestimonials,
} from './seeds/testimonial.seeder';
import { clearUsers, seedUsers } from './seeds/user.seeder';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/Cluster0';

async function seed(): Promise<void> {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  console.log('Clearing existing data...');
  await clearReceipts();
  await clearTestimonials();
  await clearInvoices();
  await clearPayments();
  await clearBookings();
  await clearServices();
  await clearUsers();
  await clearRoles();
  console.log('Done.\n');

  console.log('Seeding...');
  const roles = await seedRoles();
  const users = await seedUsers(roles);
  const services = await seedServices();
  const bookings = await seedBookings(users, services);
  const payments = await seedPayments(bookings);
  const invoices = await seedInvoices(payments);
  await seedReceipts(invoices);
  await seedTestimonials(users);

  console.log('\nSeeding completed successfully!');
  await mongoose.disconnect();
}

void (async () => {
  try {
    await seed();
  } catch (e) {
    console.error('Error during seeding:', e);
    process.exit(1);
  }
})();
