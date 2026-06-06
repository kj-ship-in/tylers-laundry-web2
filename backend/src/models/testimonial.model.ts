import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITestimonial extends Document {
  userId: Types.ObjectId;
  rating: number;
  title: string;
  content: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 255 },
    content: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

TestimonialSchema.index({ userId: 1 });
TestimonialSchema.index({ rating: 1 });
TestimonialSchema.index({ isApproved: 1 });
TestimonialSchema.index({ isActive: 1 });
TestimonialSchema.index({ createdAt: 1 });

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
