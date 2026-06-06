import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revoked: boolean;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true },
    userAgent: { type: String },
    ipAddress: { type: String, maxlength: 45 },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

SessionSchema.index({ expiresAt: 1 });
SessionSchema.index({ revoked: 1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
