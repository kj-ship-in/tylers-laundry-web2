import mongoose, { Document, Schema } from 'mongoose';

import { Permission } from '../types/enums';

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, maxlength: 100 },
    description: { type: String },
    permissions: { type: [String], enum: Object.values(Permission), default: [] },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

RoleSchema.index({ isActive: 1 });

export const Role = mongoose.model<IRole>('Role', RoleSchema);
