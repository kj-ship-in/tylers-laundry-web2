import {
  getAllCustomers,
  getAllStaffs,
  getCurrentUser,
  updateCurrentUserProfile,
  changeCurrentUserPassword,
  uploadProfilePicture,
  deleteCurrentUserAccount,
} from '@/services/user';
import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useCustomers = (
  page = 1,
  limit = 10,
  search = '',
  includeDeleted = false,
) => {
  return useQuery({
    queryKey: ['customers', page, limit, search, includeDeleted],
    queryFn: () => getAllCustomers({ page, limit, search, includeDeleted }),
    placeholderData: keepPreviousData, // v5 syntax
  });
};

export const useStaffs = (
  page = 1,
  limit = 10,
  search = '',
  includeDeleted = false,
) => {
  return useQuery({
    queryKey: ['staffs', page, limit, search, includeDeleted],
    queryFn: () => getAllStaffs({ page, limit, search, includeDeleted }),
    placeholderData: keepPreviousData, // v5 syntax
  });
};

export const useCurrentUser = () => {
  const { status } = useSession();

  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: getCurrentUser,
    staleTime: Infinity,
    enabled: status === 'authenticated',
  });
};

// User profile mutations
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changeCurrentUserPassword,
  });
};

export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: deleteCurrentUserAccount,
  });
};
