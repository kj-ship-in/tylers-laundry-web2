import mongoose, { Document, Schema, Types } from 'mongoose';

import { InvoiceStatus } from '../types/enums';

export interface IInvoice extends Document {
  paymentId: Types.ObjectId;
  invoiceNo: string;
  totalAmount: number;
  tax: number;
  discount: number;
  issuedAt: Date;
  dueDate: Date;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
      unique: true,
    },
    invoiceNo: { type: String, required: true, unique: true, maxlength: 50 },
    totalAmount: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, required: true },
    issuedAt: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.UNPAID,
    },
  },
  { timestamps: true },
);

InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ issuedAt: 1 });
InvoiceSchema.index({ dueDate: 1 });

InvoiceSchema.virtual('receipt', {
  ref: 'Receipt',
  localField: '_id',
  foreignField: 'invoiceId',
  justOne: true,
});

InvoiceSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    if (ret.paymentId && typeof ret.paymentId === 'object') {
      ret.payment = ret.paymentId;
      delete ret.paymentId;
    }
    return ret;
  },
});
InvoiceSchema.set('toObject', { virtuals: true });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
