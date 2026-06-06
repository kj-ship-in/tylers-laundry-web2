import { queryClient } from '@/lib/query-client';
import {
  createService,
  deleteService,
  getAllPublicServices,
  getAllServices,
  getServiceById,
  getServiceOverview,
  updateService,
} from '@/services/service';
import type { CreateService, UpdateService } from '@/types/service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

const USER_SERVICES_QUERY_KEY = ['services'];
const SERVICE_QUERY_KEY = ['service'];
const ADMIN_SERVICES_QUERY_KEY = ['admin-services'];

/**
 * Hook to fetch all public services
 */

export const useFetchPublicServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: getAllPublicServices,
    staleTime: Infinity, // 5 minutes
    enabled: true,
  });
};

export const useFetchServices = () => {
  return useQuery({
    queryKey: ['admin-services'],
    queryFn: getAllServices,
    staleTime: Infinity, // 5 minutes
    enabled: true,
  });
};

export const useFetchServiceStats = () => {
  const { status } = useSession();

  return useQuery({
    queryKey: ['service-stats'],
    queryFn: getServiceOverview,
    staleTime: Infinity, // 5 minutes
    enabled: status === 'authenticated',
  });
};

export const useFetchServicesById = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => getServiceById(id),
    staleTime: Infinity, // 5 minutes
    enabled: !!id,
  });
};

/**
 * Hook to create a new booking
 */
export const useCreateService = () => {
  return useMutation({
    mutationFn: (serviceData: CreateService) => createService(serviceData),
    onSuccess: () => {
      // Invalidate bookings queries to refetch
      queryClient.invalidateQueries({ queryKey: USER_SERVICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_SERVICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SERVICE_QUERY_KEY });
    },
    onError: error => {
      console.error('Failed to create booking:', error);
    },
  });
};

/**
 * Hook to update a service
 */
export const useUpdateService = () => {
  return useMutation({
    mutationFn: ({
      serviceId,
      updateData,
    }: {
      serviceId: string;
      updateData: UpdateService;
    }) => updateService(serviceId, updateData),
    onSuccess: () => {
      // Invalidate services queries to refetch
      queryClient.invalidateQueries({ queryKey: USER_SERVICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_SERVICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SERVICE_QUERY_KEY });
    },
    onError: error => {
      console.error('Failed to update service:', error);
    },
  });
};

/**
 * Hook to delete a service
 */
export const useDeleteService = (
  onSuccess?: () => void,
  onError?: (error: any) => void,
) => {
  return useMutation({
    mutationFn: async (serviceId: string) => {
      console.log('🗑️ Deleting service with ID:', serviceId);
      const result = await deleteService(serviceId);
      console.log('✅ Delete service response:', result);
      return result;
    },
    onSuccess: () => {
      console.log('🎉 Delete service success, invalidating queries');
      // Invalidate services queries to refetch
      queryClient.invalidateQueries({ queryKey: ADMIN_SERVICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_SERVICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SERVICE_QUERY_KEY });
      // Call custom success callback if provided
      onSuccess?.();
    },
    onError: error => {
      console.error('❌ Failed to delete service:', error);
      // Call custom error callback if provided
      onError?.(error);
    },
  });
};
