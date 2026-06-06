import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTestimonials,
  createTestimonial,
  getMyTestimonials,
  getTestimonialStats,
  approveTestimonial,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  getAllAdminTestimonials,
} from '@/services/testimonial';
import type {
  TestimonialQueryParams,
  TestimonialRequest,
} from '@/types/testimonials';
import { toast } from 'sonner';

// Query keys
export const testimonialKeys = {
  all: ['testimonials'] as const,
  lists: () => [...testimonialKeys.all, 'list'] as const,
  list: (params: TestimonialQueryParams) =>
    [...testimonialKeys.lists(), params] as const,
  admin: () => [...testimonialKeys.all, 'admin'] as const,
  adminList: (params: TestimonialQueryParams) =>
    [...testimonialKeys.admin(), params] as const,
  details: () => [...testimonialKeys.all, 'detail'] as const,
  detail: (id: string) => [...testimonialKeys.details(), id] as const,
  my: () => [...testimonialKeys.all, 'my'] as const,
  stats: () => [...testimonialKeys.all, 'stats'] as const,
};

// Get all testimonials
export function useTestimonials(params?: TestimonialQueryParams) {
  return useQuery({
    queryKey: testimonialKeys.list(params ?? {}),
    queryFn: async () => {
      const response = await getAllTestimonials(params);
      return response.data;
    },
  });
}

// Get all admin testimonials
export function useAdminTestimonials(params?: TestimonialQueryParams) {
  return useQuery({
    queryKey: testimonialKeys.adminList(params ?? {}),
    queryFn: async () => {
      const response = await getAllAdminTestimonials(params);
      return response;
    },
  });
}

// Get testimonial by ID
export function useTestimonial(id: string) {
  return useQuery({
    queryKey: testimonialKeys.detail(id),
    queryFn: async () => {
      const response = await getTestimonialById(id);
      return response;
    },
    enabled: !!id,
  });
}

// Get user's own testimonials
export function useMyTestimonials(enabled: boolean = false) {
  return useQuery({
    queryKey: [...testimonialKeys.my()],
    queryFn: async () => {
      const response = await getMyTestimonials();
      return response;
    },
    enabled,
  });
}

// Get admin stats
export function useTestimonialStats() {
  return useQuery({
    queryKey: testimonialKeys.stats(),
    queryFn: () => getTestimonialStats(),
  });
}

// Create testimonial
export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TestimonialRequest) => {
      const response = await createTestimonial(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch testimonials
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: testimonialKeys.my() });
      queryClient.invalidateQueries({ queryKey: testimonialKeys.stats() });

      toast.success('Testimonial submitted successfully!');
    },
    onError: error => {
      console.error('Error creating testimonial:', error);
      toast.error('Failed to submit testimonial. Please try again.');
    },
  });
}

// Update testimonial
export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TestimonialRequest>;
    }) => {
      const response = await updateTestimonial(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: testimonialKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: testimonialKeys.my() });
      queryClient.invalidateQueries({ queryKey: testimonialKeys.stats() });

      toast.success('Testimonial updated successfully!');
    },
    onError: error => {
      console.error('Error updating testimonial:', error);
      toast.error('Failed to update testimonial. Please try again.');
    },
  });
}

// Approve testimonial (admin only)
export function useApproveTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await approveTestimonial(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: testimonialKeys.admin() });
      queryClient.invalidateQueries({
        queryKey: testimonialKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: testimonialKeys.stats() });

      toast.success('Testimonial approved successfully!');
    },
    onError: error => {
      console.error('Error approving testimonial:', error);
      toast.error('Failed to approve testimonial. Please try again.');
    },
  });
}

// Delete testimonial
export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteTestimonial(id);
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: testimonialKeys.admin() });
      queryClient.invalidateQueries({ queryKey: testimonialKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: testimonialKeys.my() });
      queryClient.invalidateQueries({ queryKey: testimonialKeys.stats() });

      toast.success('Testimonial deleted successfully!');
    },
    onError: error => {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial. Please try again.');
    },
  });
}
