import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  title: string;
  type: string;
  description?: string;
  price: number;
  features: string[];
  turnaround?: string;
  includes: string[];
  ideal?: string;
  estimatedTime?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, maxlength: 100 },
    type: { type: String, required: true, maxlength: 100 },
    description: { type: String },
    price: { type: Number, required: true },
    features: { type: [String], default: [] },
    turnaround: { type: String, maxlength: 100 },
    includes: { type: [String], default: [] },
    ideal: { type: String },
    estimatedTime: { type: String, maxlength: 50 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ServiceSchema.index({ type: 1 });
ServiceSchema.index({ isActive: 1 });
ServiceSchema.index({ title: 1 });
ServiceSchema.index({ price: 1 });

export const Service = mongoose.model<IService>('Service', ServiceSchema);
