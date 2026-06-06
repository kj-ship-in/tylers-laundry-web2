import type { Role } from '@/types/role';
import type { Permission } from '@/types/permission';
import apiClient from '@/utils/api-client';
import type { User } from '@/types/user';

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface AssignPermissionsData {
  permissions: Permission[];
}

export interface AssignRoleToUserData {
  userId: string;
  roleId: string;
}

export interface UserPermissionsData {
  permissions: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Create a new role
 */
export const createRole = async (
  data: CreateRoleData,
): Promise<ApiResponse<Role>> => {
  const response = await apiClient.post('/roles/create', data);

  return response.data;
};

/**
 * Get all roles
 */
export const getAllRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('/roles/getAll');

  return response.data;
};

/**
 * Get all permissions
 */
export const getAllPermissions = async (): Promise<string[]> => {
  const response = await apiClient.get('/permissions');

  return response.data.data;
};

/**
 * Get a single role by ID
 */
export const getRoleById = async (id: string): Promise<Role> => {
  const response = await apiClient.get(`/roles/getById/${id}`);
  return response.data;
};

/**
 * Update a role by ID
 */
export const updateRole = async (
  id: string,
  data: UpdateRoleData,
): Promise<ApiResponse<Role>> => {
  const response = await apiClient.put(`/roles/update/${id}`, data);
  return response.data;
};

/**
 * Delete a role by ID
 */
export const deleteRole = async (
  id: string,
): Promise<ApiResponse<{ success: boolean }>> => {
  const response = await apiClient.delete(`/roles/delete/${id}`);
  return response.data;
};

/**
 * Assign permissions to a role
 */
export const assignPermissionsToRole = async (
  id: string,
  data: AssignPermissionsData,
): Promise<ApiResponse<Role>> => {
  const response = await apiClient.put(`/roles/assign/${id}/permissions`, data);
  return response.data;
};

/**
 * Assign role to user
 */
export const assignRoleToUser = async (
  data: AssignRoleToUserData,
): Promise<ApiResponse<User>> => {
  const response = await apiClient.put('/roles/users/assign', data);
  return response.data;
};

/**
 * Reset user permissions to role defaults
 */
export const resetUserPermissions = async (
  userId: string,
): Promise<ApiResponse<User>> => {
  const response = await apiClient.put(
    `/roles/users/${userId}/permissions/reset`,
  );
  return response.data;
};

/**
 * Add permissions to user
 */
export const addUserPermissions = async (
  userId: string,
  data: UserPermissionsData,
): Promise<ApiResponse<User>> => {
  const response = await apiClient.put(
    `/roles/users/${userId}/permissions/add`,
    data,
  );
  return response.data;
};

/**
 * Remove permissions from user
 */
export const removeUserPermissions = async (
  userId: string,
  data: UserPermissionsData,
): Promise<ApiResponse<User>> => {
  const response = await apiClient.put(
    `/roles/users/${userId}/permissions/remove`,
    data,
  );
  return response.data;
};
