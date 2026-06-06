export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  users?: {
    _id: string;
    name: string;
    email: string;
  }[];
}

export interface PermissionInfo {
  name: string;
  description: string;
}
