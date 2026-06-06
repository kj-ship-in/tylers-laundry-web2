/* eslint-disable no-console */
import { Booking, IBooking } from '../../models/booking.model';
import { IService } from '../../models/service.model';
import { IUser } from '../../models/user.model';
import { BookingStatus } from '../../types/enums';

export async function clearBookings(): Promise<void> {
  await Booking.deleteMany({});
  console.log('  Cleared: bookings');
}

export async function seedBookings(
  users: {
    user1: IUser;
    user2: IUser;
    user3: IUser;
    user4: IUser;
    user5: IUser;
  },
  services: {
    washFold: IService;
    dryCleaning: IService;
    ironing: IService;
    washIron: IService;
    premiumCare: IService;
  },
): Promise<IBooking[]> {
  const { user1, user2, user3, user4, user5 } = users;
  const { washFold, dryCleaning, ironing, washIron, premiumCare } = services;

  const bookings = await Booking.insertMany([
    {
      userId: user1._id,
      serviceId: washFold._id,
      pickupAddress: 'Bakau, The Gambia',
      deliveryAddress: 'Bakau, The Gambia',
      date: new Date('2025-01-10'),
      pickupTime: '09:00',
      status: BookingStatus.DELIVERED,
      totalAmount: 170.0,
      deliveryFee: 20.0,
      note: 'Please use unscented detergent',
    },
    {
      userId: user1._id,
      serviceId: ironing._id,
      pickupAddress: 'Bakau, The Gambia',
      deliveryAddress: 'Bakau, The Gambia',
      date: new Date('2025-02-14'),
      pickupTime: '10:30',
      status: BookingStatus.DELIVERED,
      totalAmount: 100.0,
      deliveryFee: 20.0,
    },
    {
      userId: user2._id,
      serviceId: dryCleaning._id,
      pickupAddress: 'Brikama, The Gambia',
      deliveryAddress: 'Brikama, The Gambia',
      date: new Date('2025-02-20'),
      pickupTime: '11:00',
      status: BookingStatus.DELIVERED,
      totalAmount: 270.0,
      deliveryFee: 20.0,
      note: 'Two suits and one evening gown',
    },
    {
      userId: user2._id,
      serviceId: washIron._id,
      pickupAddress: 'Brikama, The Gambia',
      deliveryAddress: 'Brikama, The Gambia',
      date: new Date('2025-03-05'),
      pickupTime: '14:00',
      status: BookingStatus.COMPLETED,
      totalAmount: 220.0,
      deliveryFee: 20.0,
    },
    {
      userId: user3._id,
      serviceId: premiumCare._id,
      pickupAddress: 'Kanifing, The Gambia',
      deliveryAddress: 'Kanifing, The Gambia',
      date: new Date('2025-03-18'),
      pickupTime: '08:30',
      status: BookingStatus.DELIVERED,
      totalAmount: 420.0,
      deliveryFee: 20.0,
      note: 'Silk blouses — handle with extreme care',
    },
    {
      userId: user3._id,
      serviceId: washFold._id,
      pickupAddress: 'Kanifing, The Gambia',
      deliveryAddress: 'Kanifing, The Gambia',
      date: new Date('2025-04-02'),
      pickupTime: '13:00',
      status: BookingStatus.DELIVERED,
      totalAmount: 170.0,
      deliveryFee: 20.0,
    },
    {
      userId: user4._id,
      serviceId: ironing._id,
      pickupAddress: 'Fajara, The Gambia',
      deliveryAddress: 'Fajara, The Gambia',
      date: new Date('2025-04-10'),
      pickupTime: '09:30',
      status: BookingStatus.CANCELLED,
      totalAmount: 100.0,
      deliveryFee: 20.0,
      note: 'Cancelled — customer rescheduled',
    },
    {
      userId: user4._id,
      serviceId: washFold._id,
      pickupAddress: 'Fajara, The Gambia',
      deliveryAddress: 'Fajara, The Gambia',
      date: new Date('2025-04-22'),
      pickupTime: '10:00',
      status: BookingStatus.COMPLETED,
      totalAmount: 170.0,
      deliveryFee: 20.0,
    },
    {
      userId: user5._id,
      serviceId: washIron._id,
      pickupAddress: 'Bundung, The Gambia',
      deliveryAddress: 'Bundung, The Gambia',
      date: new Date('2025-05-07'),
      pickupTime: '15:00',
      status: BookingStatus.IN_PROGRESS,
      totalAmount: 220.0,
      deliveryFee: 20.0,
    },
    {
      userId: user5._id,
      serviceId: dryCleaning._id,
      pickupAddress: 'Bundung, The Gambia',
      deliveryAddress: 'Bundung, The Gambia',
      date: new Date('2025-05-20'),
      pickupTime: '11:30',
      status: BookingStatus.PENDING,
      totalAmount: 270.0,
      deliveryFee: 20.0,
      note: 'Wedding outfit — very important',
    },
  ]);

  console.log(`  Seeded: bookings (${bookings.length} records)`);
  return bookings;
}
