import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  deliveryAddress: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  serviceType: z.string().optional(),
  note: z.string().optional(),
});

export const createAdminBookingSchema = z.object({
  userId: z.string().min(1, 'Client is required'),
  serviceId: z.string().min(1, 'Service is required'),
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  deliveryAddress: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  serviceType: z.string().optional(),
  note: z.string().optional(),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  deliveryFee: z.number().min(0, 'Delivery fee must be positive'),
});

export const schedulePickupSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  deliveryAddress: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  note: z.string().optional(),
});

export const updateBookingSchema = z.object({
  pickupAddress: z.string().optional(),
  deliveryAddress: z.string().optional(),
  date: z.coerce.date().optional(),
  pickupTime: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  totalAmount: z.coerce.number().optional(),
  deliveryFee: z.coerce.number().optional(),
  note: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof createBookingSchema>;
export type AdminBookingFormValues = z.infer<typeof createAdminBookingSchema>;
export type SchedulePickupFormValues = z.infer<typeof schedulePickupSchema>;
