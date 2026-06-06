import mongoose, { Document, Schema, Types } from 'mongoose';

import { PaymentMethod, PaymentStatus } from '../types/enums';

export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  transactionId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    transactionId: { type: String, required: true, unique: true, maxlength: 100 },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, maxlength: 3 },
    method: { type: String, enum: Object.values(PaymentMethod), required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    gatewayResponse: { type: String },
  },
  { timestamps: true },
);

PaymentSchema.index({ status: 1 });
PaymentSchema.index({ method: 1 });
PaymentSchema.index({ createdAt: 1 });

PaymentSchema.virtual('invoice', {
  ref: 'Invoice',
  localField: '_id',
  foreignField: 'paymentId',
  justOne: true,
});

PaymentSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    if (ret.bookingId && typeof ret.bookingId === 'object') {
      ret.booking = ret.bookingId;
      delete ret.bookingId;
    }
    return ret;
  },
});
PaymentSchema.set('toObject', { virtuals: true });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
