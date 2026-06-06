import mongoose, { Document, Schema, Types } from 'mongoose';

import { BookingStatus } from '../types/enums';

export interface IBooking extends Document {
  userId: Types.ObjectId;
  serviceId: Types.ObjectId;
  pickupAddress: string;
  deliveryAddress: string;
  date: Date;
  pickupTime: string;
  status: BookingStatus;
  totalAmount: number;
  deliveryFee: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    pickupAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    date: { type: Date, required: true },
    pickupTime: { type: String, required: true, maxlength: 50 },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    totalAmount: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    note: { type: String },
  },
  { timestamps: true },
);

BookingSchema.index({ userId: 1 });
BookingSchema.index({ serviceId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ date: 1 });
BookingSchema.index({ createdAt: 1 });

BookingSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'bookingId',
});

BookingSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    if (ret.userId && typeof ret.userId === 'object') {
      ret.user = ret.userId;
      delete ret.userId;
    }
    if (ret.serviceId && typeof ret.serviceId === 'object') {
      ret.service = ret.serviceId;
      delete ret.serviceId;
    }
    return ret;
  },
});
BookingSchema.set('toObject', { virtuals: true });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
