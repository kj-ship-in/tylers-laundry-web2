import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReceipt extends Document {
  invoiceId: Types.ObjectId;
  receiptNo: string;
  issuedAt: Date;
  receivedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, unique: true },
    receiptNo: { type: String, required: true, unique: true, maxlength: 50 },
    issuedAt: { type: Date, required: true },
    receivedBy: { type: String, maxlength: 255 },
    notes: { type: String },
  },
  { timestamps: true },
);

ReceiptSchema.index({ issuedAt: 1 });

ReceiptSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    if (ret.invoiceId && typeof ret.invoiceId === 'object') {
      ret.invoice = ret.invoiceId;
      delete ret.invoiceId;
    }
    return ret;
  },
});
ReceiptSchema.set('toObject', { virtuals: true });

export const Receipt = mongoose.model<IReceipt>('Receipt', ReceiptSchema);
