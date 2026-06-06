/* eslint-disable no-console */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { Booking } from '../models/booking.model';
import { EmailVerification } from '../models/email-verification.model';
import { Invoice } from '../models/invoice.model';
import { PasswordResetToken } from '../models/password-reset-token.model';
import { Payment } from '../models/payment.model';
import { Receipt } from '../models/receipt.model';
import { Role } from '../models/role.model';
import { Service } from '../models/service.model';
import { Session } from '../models/session.model';
import { Testimonial } from '../models/testimonial.model';
import { User } from '../models/user.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI ?? '';

async function migrate(): Promise<void> {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const models = [
    { name: 'Role', model: Role },
    { name: 'User', model: User },
    { name: 'Service', model: Service },
    { name: 'Booking', model: Booking },
    { name: 'Payment', model: Payment },
    { name: 'Invoice', model: Invoice },
    { name: 'Receipt', model: Receipt },
    { name: 'Testimonial', model: Testimonial },
    { name: 'Session', model: Session },
    { name: 'EmailVerification', model: EmailVerification },
    { name: 'PasswordResetToken', model: PasswordResetToken },
  ];

  console.log('Syncing indexes for all collections...');
  for (const { name, model } of models) {
    await model.syncIndexes();
    console.log(`  ✓ ${name}`);
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

void (async () => {
  try {
    await migrate();
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
})();
