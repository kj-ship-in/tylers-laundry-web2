import {
  createStaff,
  updateStaff,
  deleteStaff,
  deleteCustomer,
  toggleStaffStatus,
} from '@/services/user';
import type { AuthResponse } from '@/types/auth';
import type { CreateAccountFormValues } from '@/utils/schemas/create-account-schema';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

export const useCreateStaffMutation = (
  options: UseMutationOptions<
    AuthResponse,
    unknown,
    CreateAccountFormValues,
    unknown
  >,
) => {
  return useMutation({
    mutationKey: ['create-staff'],
    mutationFn: async (payload: CreateAccountFormValues) => {
      const response = await createStaff(payload);
      return response;
    },
    ...options,
  });
};

export const useUpdateStaffMutation = (
  options: UseMutationOptions<
    AuthResponse,
    unknown,
    { staffId: string; data: Partial<CreateAccountFormValues> },
    unknown
  >,
) => {
  return useMutation({
    mutationKey: ['update-staff'],
    mutationFn: async ({
      staffId,
      data,
    }: {
      staffId: string;
      data: Partial<CreateAccountFormValues>;
    }) => {
      const response = await updateStaff(staffId, data);
      return response;
    },
    ...options,
  });
};

export const useDeleteStaffMutation = (
  options: UseMutationOptions<{ message: string }, unknown, string, unknown>,
) => {
  return useMutation({
    mutationKey: ['delete-staff'],
    mutationFn: async (staffId: string) => {
      const response = await deleteStaff(staffId);
      return response;
    },
    ...options,
  });
};

export const useToggleStaffStatusMutation = (
  options: UseMutationOptions<
    AuthResponse,
    unknown,
    { staffId: string; isActive: boolean },
    unknown
  >,
) => {
  return useMutation({
    mutationKey: ['toggle-staff-status'],
    mutationFn: async ({
      staffId,
      isActive,
    }: {
      staffId: string;
      isActive: boolean;
    }) => {
      const response = await toggleStaffStatus(staffId, isActive);
      return response;
    },
    ...options,
  });
};

export const useDeleteCustomerMutation = (
  options: UseMutationOptions<{ message: string }, unknown, string, unknown>,
) => {
  return useMutation({
    mutationKey: ['delete-customer'],
    mutationFn: async (customerId: string) => {
      const response = await deleteCustomer(customerId);
      return response;
    },
    ...options,
  });
};
