import { z } from 'zod';

import {
  CreateRoleSchema,
  UpdateRoleSchema,
  AssignPermissionsSchema,
  AssignRoleToUserSchema,
  UserPermissionsSchema,
  RoleIdSchema,
  UserIdSchema,
} from '../validators/role.schema';

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
export type AssignPermissionsInput = z.infer<typeof AssignPermissionsSchema>;
export type AssignRoleToUserInput = z.infer<typeof AssignRoleToUserSchema>;
export type UserPermissionsInput = z.infer<typeof UserPermissionsSchema>;
export type RoleIdParams = z.infer<typeof RoleIdSchema>;
export type UserIdParams = z.infer<typeof UserIdSchema>;

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  users?: {
    id: string;
    name: string;
    email: string;
  }[];
}

export interface PermissionInfo {
  name: string;
  description: string;
}
