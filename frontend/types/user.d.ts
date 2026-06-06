export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: 'USER' | 'STAFF' | 'ADMIN' | string;
  roleId: string;
  permissions?: string[];
  profileUrl?: string;
  lastLogin?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
}
