/* eslint-disable no-console */
import dotenv from 'dotenv';

dotenv.config();

import mongoose from 'mongoose';
import User from './src/models/user.model';
import Receipt from './src/models/receipt.model';
import Service from './src/models/service.model';

async function checkDatabase() {
  console.log('Checking database contents...');

  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ MongoDB connection successful');

    const userCount = await User.countDocuments();
    console.log('Users count:', userCount);

    const receipts = await Receipt.find()
      .populate({
        path: 'invoiceId',
        populate: {
          path: 'paymentId',
          populate: {
            path: 'bookingId',
            populate: ['userId', 'serviceId'],
          },
        },
      })
      .lean();

    console.log('Receipts found:', receipts.length);
    if (receipts.length > 0) {
      console.log('First receipt:', JSON.stringify(receipts[0], null, 2));
    }

    const users = await User.find().lean();
    console.log('Users found:', users.length);

    const services = await Service.find().lean();
    console.log('Services found:', services.length);
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabase();
