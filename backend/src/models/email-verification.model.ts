import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmailVerification extends Document {
  userId: Types.ObjectId;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    code: { type: String, required: true, unique: true, maxlength: 6 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

EmailVerificationSchema.index({ expiresAt: 1 });

export const EmailVerification = mongoose.model<IEmailVerification>(
  'EmailVerification',
  EmailVerificationSchema,
);
