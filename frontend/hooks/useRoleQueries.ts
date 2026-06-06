import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
  getAllPermissions,
  assignRoleToUser,
  resetUserPermissions,
  addUserPermissions,
  removeUserPermissions,
  type CreateRoleData,
  type UpdateRoleData,
  type AssignPermissionsData,
  type AssignRoleToUserData,
  type UserPermissionsData,
} from '@/services/role-permission';

// Query keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  permissions: () => [...roleKeys.all, 'permissions'] as const,
};

export const userRoleKeys = {
  all: ['user-roles'] as const,
  permissions: (userId: string) =>
    [...userRoleKeys.all, 'permissions', userId] as const,
};

// Role hooks
export function useRoles() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: getAllRoles,
    enabled: !!session?.accessToken,
  });
}

export function useRole(id: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => getRoleById(id),
    enabled: !!id && !!session?.accessToken,
  });
}

export function useAllPermissions() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: getAllPermissions,
    enabled: !!session?.accessToken,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleData) => createRole(data),
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success(response.message ?? 'Role created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to create role');
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleData }) =>
      updateRole(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      toast.success(response.message ?? 'Role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to update role');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.removeQueries({ queryKey: roleKeys.detail(id) });
      toast.success(response.message ?? 'Role deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to delete role');
    },
  });
}

export function useAssignPermissionsToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignPermissionsData }) =>
      assignPermissionsToRole(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      toast.success(response.message ?? 'Permissions assigned successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? 'Failed to assign permissions',
      );
    },
  });
}

// User role/permission hooks
export function useAssignRoleToUser() {
  return useMutation({
    mutationFn: (data: AssignRoleToUserData) => assignRoleToUser(data),
    onSuccess: response => {
      // Invalidate user-related queries if needed
      toast.success(response.message ?? 'Role assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to assign role');
    },
  });
}

export function useResetUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => resetUserPermissions(userId),
    onSuccess: (response, userId) => {
      queryClient.invalidateQueries({
        queryKey: userRoleKeys.permissions(userId),
      });
      toast.success(response.message ?? 'Permissions reset successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? 'Failed to reset permissions',
      );
    },
  });
}

export function useAddUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UserPermissionsData;
    }) => addUserPermissions(userId, data),
    onSuccess: (response, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: userRoleKeys.permissions(userId),
      });
      toast.success(response.message ?? 'Permissions added successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? 'Failed to add permissions',
      );
    },
  });
}

export function useRemoveUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UserPermissionsData;
    }) => removeUserPermissions(userId, data),
    onSuccess: (response, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: userRoleKeys.permissions(userId),
      });
      toast.success(response.message ?? 'Permissions removed successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? 'Failed to remove permissions',
      );
    },
  });
}
