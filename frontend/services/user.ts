import type { AuthResponse } from '@/types/auth';
import type { ApiResponse, PaginationParams, User } from '@/types/user';
import apiClient from '@/utils/api-client';
import type { CreateAccountFormValues } from '@/utils/schemas/create-account-schema';
import type {
  UpdateProfileFormValues,
  ChangePasswordFormValues,
  DeleteCustomerFormValues,
} from '@/utils/schemas/user-settings.schema';

/**
 * Create a new booking
 */
export const createStaff = async (
  payload: CreateAccountFormValues,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/admin/staff/register',
    payload,
  );
  return response.data;
};

/**
 * Update staff information
 */
export const updateStaff = async (
  staffId: string,
  payload: Partial<CreateAccountFormValues>,
): Promise<AuthResponse> => {
  const response = await apiClient.patch<AuthResponse>(
    `/user/admin/staff/${staffId}`,
    payload,
  );
  return response.data;
};

/**
 * Delete staff
 */
export const deleteStaff = async (
  staffId: string,
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/admin/staff/${staffId}`,
  );
  return response.data;
};

/**
 * Delete customer
 */
export const deleteCustomer = async (
  customerId: string,
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/admin/customers/${customerId}`,
  );
  return response.data;
};

/**
 * Block/Unblock staff
 */
export const toggleStaffStatus = async (
  staffId: string,
  isActive: boolean,
): Promise<AuthResponse> => {
  const response = await apiClient.patch<AuthResponse>(
    `/admin/users/${staffId}/status`,
    { isActive },
  );
  return response.data;
};

/**
 * Get all bookings (admin/staff only)
 */
export const getAllCustomers = async (
  params: PaginationParams,
): Promise<ApiResponse<User[]>> => {
  const response = await apiClient.get<ApiResponse<User[]>>(
    '/user/admin/customers',
    { params },
  );
  return response.data;
};

export const getAllStaffs = async (
  params: PaginationParams,
): Promise<ApiResponse<User[]>> => {
  const response = await apiClient.get<ApiResponse<User[]>>(
    '/user/admin/staffs',
    { params },
  );
  return response.data;
};
/**
 * Get a specific booking by ID
 */
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`/user/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching booking ${userId}:`, error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Update current user profile
 */
export const updateCurrentUserProfile = async (
  payload: UpdateProfileFormValues,
): Promise<User> => {
  const response = await apiClient.patch<User>(
    '/user/profile-details',
    payload,
  );
  return response.data;
};

/**
 * Change current user password
 */
export const changeCurrentUserPassword = async (
  payload: ChangePasswordFormValues,
): Promise<{ message: string }> => {
  const response = await apiClient.patch<{ message: string }>(
    '/auth/change-password',
    payload,
  );
  return response.data;
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (
  file: File,
): Promise<{ message: string; data: User }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.patch<{ message: string; data: User }>(
    '/user/profile-picture',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/user/me');
  return response.data;
};

/**
 * Delete current user account
 */
export const deleteCurrentUserAccount = async (
  payload: DeleteCustomerFormValues,
): Promise<{
  message: string;
}> => {
  const response = await apiClient.delete<{ message: string }>('/user/me', {
    data: payload,
  });
  return response.data;
};
