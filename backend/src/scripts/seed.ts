/* eslint-disable no-console */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { Booking } from '../models/booking.model';
import { Invoice } from '../models/invoice.model';
import { Payment } from '../models/payment.model';
import { Receipt } from '../models/receipt.model';
import { Role } from '../models/role.model';
import { Service } from '../models/service.model';
import { Testimonial } from '../models/testimonial.model';
import { User } from '../models/user.model';
import {
  BookingStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  Permission,
} from '../types/enums';
import { hashPassword } from '../utils/hash';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/tylers-laundry';

async function seed(): Promise<void> {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  console.log('Starting database seeding...');

  // Clear existing data
  await Receipt.deleteMany({});
  await Testimonial.deleteMany({});
  await Invoice.deleteMany({});
  await Payment.deleteMany({});
  await Booking.deleteMany({});
  await Service.deleteMany({});
  await User.deleteMany({});
  await Role.deleteMany({});

  console.log('Cleared existing data');

  console.log('Creating system roles...');

  const userRole = await Role.create({
    name: 'USER',
    description: 'Regular user with basic access',
    permissions: [
      Permission.PROFILE_VIEW_OWN,
      Permission.PROFILE_UPDATE_OWN,
      Permission.BOOKING_VIEW_OWN,
      Permission.BOOKING_CREATE,
      Permission.TESTIMONIAL_CREATE,
      Permission.TESTIMONIAL_VIEW,
      Permission.TESTIMONIAL_UPDATE,
      Permission.SERVICE_VIEW,
    ],
    isSystem: true,
    isActive: true,
  });

  const staffRole = await Role.create({
    name: 'STAFF',
    description: 'Staff member with operational access',
    permissions: [
      Permission.PROFILE_VIEW_OWN,
      Permission.PROFILE_UPDATE_OWN,
      Permission.BOOKING_VIEW_ALL,
      Permission.BOOKING_UPDATE_STATUS,
      Permission.USER_VIEW,
      Permission.SERVICE_VIEW,
      Permission.SERVICE_UPDATE,
      Permission.ANALYTICS_VIEW,
      Permission.REPORTS_VIEW,
      Permission.PDF_GENERATE_INVOICE,
      Permission.PDF_GENERATE_RECEIPT,
      Permission.BOOKING_CREATE_FOR_CLIENT,
    ],
    isSystem: true,
    isActive: true,
  });

  const adminRole = await Role.create({
    name: 'ADMIN',
    description: 'Administrator with full system access',
    permissions: Object.values(Permission),
    isSystem: true,
    isActive: true,
  });

  console.log('System roles created');

  console.log('Creating users...');

  const johnUser = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: await hashPassword('Password123'),
    roleId: userRole._id,
    phone: '+2201234567',
    profileUrl: '/uploads/profile.jpg',
    address: 'Bakau, The Gambia',
    isVerified: true,
    permissions: [Permission.TESTIMONIAL_VIEW],
  });

  await User.create({
    name: 'Kiera Johnson',
    email: 'admin@tylers.com',
    password: await hashPassword('Admin123'),
    roleId: adminRole._id,
    phone: '+2209876543',
    profileUrl: '/uploads/profile.jpg',
    address: 'Kololi, The Gambia',
    isVerified: true,
    permissions: [Permission.SETTINGS_UPDATE, Permission.PERMISSION_ASSIGN],
  });

  const aliStaff = await User.create({
    name: 'Keoka Johnson',
    email: 'staff@tylers.com',
    password: await hashPassword('Staff123'),
    roleId: staffRole._id,
    phone: '+2202223333',
    profileUrl: '/uploads/profile.jpg',
    address: 'Kololi, The Gambia',
    isVerified: true,
    permissions: [Permission.USER_CREATE, Permission.SERVICE_DELETE],
  });

  const awaUser = await User.create({
    name: 'Awa Ceesay',
    email: 'awa@example.com',
    password: await hashPassword('Password123'),
    roleId: userRole._id,
    phone: '+2205556666',
    profileUrl: '/uploads/profile.jpg',
    address: 'Brikama, The Gambia',
  });

  console.log('Users created');

  await Service.insertMany([
    {
      title: 'Wash & Fold',
      type: 'wash-fold',
      price: 15.0,
      description: 'Professional washing and folding service',
      features: [
        'Same-day service',
        'Eco-friendly detergents',
        'Sorted by preference',
      ],
      turnaround: '24-48 hours',
      includes: [
        'Washing',
        'Drying',
        'Folding',
        'Sorting by color',
        'Fabric softener',
      ],
      ideal: 'Everyday wear, casual clothing, bed linens',
      estimatedTime: '24-48 hours',
      isActive: true,
    },
    {
      title: 'Dry Cleaning',
      type: 'dry-clean',
      price: 25.0,
      description: 'Professional dry cleaning service for delicate fabrics',
      features: [
        'Expert stain removal',
        'Gentle on fabrics',
        'Professional pressing',
      ],
      turnaround: '48-72 hours',
      includes: [
        'Dry cleaning',
        'Stain treatment',
        'Professional pressing',
        'Hanger packaging',
        'Fabric protection',
      ],
      ideal: 'Suits, dresses, delicate fabrics, formal wear',
      estimatedTime: '48-72 hours',
      isActive: true,
    },
    {
      title: 'Ironing Service',
      type: 'ironing',
      price: 8.0,
      description: 'Professional ironing and folding service',
      features: ['Quick turnaround', 'Crisp finishing', 'Careful handling'],
      turnaround: '12-24 hours',
      includes: [
        'Professional ironing',
        'Neat folding',
        'Hanging option',
        'Wrinkle-free guarantee',
      ],
      ideal: 'Shirts, pants, everyday clothing',
      estimatedTime: '12-24 hours',
      isActive: true,
    },
    {
      title: 'Wash & Iron',
      type: 'wash-iron',
      price: 20.0,
      description: 'Complete wash and iron combo package',
      features: ['All-in-one service', 'Time-saving', 'Professional finish'],
      turnaround: '24-48 hours',
      includes: [
        'Washing',
        'Drying',
        'Professional ironing',
        'Folding or hanging',
        'Quality detergent',
      ],
      ideal: 'Business attire, formal wear, everyday clothes',
      estimatedTime: '24-48 hours',
      isActive: true,
    },
  ]);
  console.log('Services created');

  const service1 = await Service.findOne({ type: 'wash-fold' });

  const booking = await Booking.create({
    userId: johnUser._id,
    serviceId: service1!._id,
    pickupAddress: 'Bakau, The Gambia',
    deliveryAddress: 'Bakau, The Gambia',
    date: new Date(),
    pickupTime: '14:30',
    status: BookingStatus.PENDING,
    totalAmount: 120.0,
    deliveryFee: 20.0,
    note: 'Handle with care',
  });
  console.log('Booking created');

  const payment = await Payment.create({
    bookingId: booking._id,
    transactionId: 'TXN-123456',
    amount: 120.0,
    currency: 'GMD',
    method: PaymentMethod.WAVE,
    status: PaymentStatus.PAID,
    gatewayResponse: 'Success - Wave payment completed',
  });
  console.log('Payment created');

  const invoice = await Invoice.create({
    paymentId: payment._id,
    invoiceNo: 'INV-0001',
    totalAmount: 120.0,
    tax: 10.0,
    discount: 0.0,
    issuedAt: new Date(),
    dueDate: new Date(),
    status: InvoiceStatus.PAID,
  });
  console.log('Invoice created');

  await Receipt.create({
    invoiceId: invoice._id,
    receiptNo: 'REC-0001',
    issuedAt: new Date(),
    receivedBy: 'John Doe',
    notes: 'Payment received in full.',
  });
  console.log('Receipt created');

  await Testimonial.insertMany([
    {
      userId: johnUser._id,
      rating: 5,
      title: 'Excellent Service!',
      content:
        "Tyler's Laundry has been a lifesaver! Their wash and fold service is incredibly convenient, and my clothes always come back clean and neatly folded. Highly recommend!",
      isApproved: true,
      isActive: true,
    },
    {
      userId: awaUser._id,
      rating: 5,
      title: 'Best Dry Cleaning in Town',
      content:
        "I trust Tyler's with all my delicate fabrics. Their dry cleaning service is top-notch, and they always handle my clothes with care. The staff is professional and friendly.",
      isApproved: true,
      isActive: true,
    },
    {
      userId: aliStaff._id,
      rating: 4,
      title: 'Quick and Reliable',
      content:
        'Great ironing service! They turned my wrinkled shirts into crisp, professional-looking garments in no time. Very satisfied with the quality.',
      isApproved: true,
      isActive: true,
    },
  ]);
  console.log('Testimonials created');

  console.log('Seeding completed successfully!');
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
