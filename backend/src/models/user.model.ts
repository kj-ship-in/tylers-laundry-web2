import mongoose, { Document, Schema, Types } from 'mongoose';

import { Permission } from '../types/enums';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  roleId: Types.ObjectId;
  permissions: Permission[];
  phone?: string;
  address?: string;
  profileUrl?: string;
  lastLogin?: Date;
  isVerified: boolean;
  isBiometricsEnabled: boolean;
  pin?: string;
  isActive: boolean;
  deletionReason?: string;
  passwordUpdatedAt?: Date;
  deletedAt?: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, maxlength: 255 },
    email: { type: String, required: true, unique: true, maxlength: 255 },
    password: { type: String, required: true, maxlength: 255 },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    permissions: { type: [String], enum: Object.values(Permission), default: [] },
    phone: { type: String, maxlength: 20 },
    address: { type: String },
    profileUrl: { type: String },
    lastLogin: { type: Date },
    isVerified: { type: Boolean, default: false },
    isBiometricsEnabled: { type: Boolean, default: false },
    pin: { type: String, unique: true, sparse: true, maxlength: 255 },
    isActive: { type: Boolean, default: true },
    deletionReason: { type: String },
    passwordUpdatedAt: { type: Date },
    deletedAt: { type: Date },
    verifiedAt: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ roleId: 1 });
UserSchema.index({ deletedAt: 1, isActive: 1 });
UserSchema.index({ createdAt: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
