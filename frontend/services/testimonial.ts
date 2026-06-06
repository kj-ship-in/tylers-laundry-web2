import type { ApiResponse } from '@/types/user';
import type {
  Testimonial,
  TestimonialQueryParams,
  TestimonialRequest,
  TestimonialStats,
} from '@/types/testimonials';
import apiClient from '@/utils/api-client';
import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

if (!BASE_URL) {
  throw new Error('API URL is not defined');
}

/**
 * Get all testimonials with pagination and filters
 */
export const getAllTestimonials = async (
  params: Partial<TestimonialQueryParams> = {},
): Promise<ApiResponse<Testimonial[]>> => {
  const response = await axios.get<ApiResponse<Testimonial[]>>(
    `${BASE_URL}/testimonials`,
    { params },
  );
  return response.data;
};

/**
 * Create a new testimonial
 */
export const createTestimonial = async (
  payload: TestimonialRequest,
): Promise<ApiResponse<Testimonial>> => {
  const response = await apiClient.post<ApiResponse<Testimonial>>(
    '/testimonials/create',
    payload,
  );
  return response.data;
};

/**
 * Get all testimonials with pagination and filters
 */
export const getAllAdminTestimonials = async (
  params: Partial<TestimonialQueryParams> = {},
): Promise<ApiResponse<Testimonial[]>> => {
  const response = await apiClient.get<ApiResponse<Testimonial[]>>(
    `/testimonials/admin/getAll`,
    { params },
  );
  return response.data;
};

/**
 * Get user's own testimonials
 */
export const getMyTestimonials = async (): Promise<Testimonial> => {
  const response = await apiClient.get<Testimonial>('/testimonials/user/me');
  return response.data;
};

/**
 * Get admin stats
 */
export const getTestimonialStats = async (): Promise<TestimonialStats> => {
  const response = await apiClient.get<TestimonialStats>(
    '/testimonials/admin/stats',
  );
  return response.data;
};

/**
 * Approve a testimonial (admin only)
 */
export const approveTestimonial = async (
  testimonialId: string,
): Promise<ApiResponse<Testimonial>> => {
  const response = await apiClient.put<ApiResponse<Testimonial>>(
    `/testimonials/${testimonialId}/approve`,
  );
  return response.data;
};

/**
 * Get specific testimonial by ID
 */
export const getTestimonialById = async (
  testimonialId: string,
): Promise<ApiResponse<Testimonial>> => {
  const response = await apiClient.get<ApiResponse<Testimonial>>(
    `/testimonials/get/${testimonialId}`,
  );
  return response.data;
};

/**
 * Update a testimonial
 */
export const updateTestimonial = async (
  testimonialId: string,
  payload: Partial<TestimonialRequest>,
): Promise<ApiResponse<Testimonial>> => {
  const response = await apiClient.put<ApiResponse<Testimonial>>(
    `/testimonials/update/${testimonialId}`,
    payload,
  );
  return response.data;
};

/**
 * Delete a testimonial
 */
export const deleteTestimonial = async (
  testimonialId: string,
): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/testimonials/delete/${testimonialId}`,
  );
  return response.data;
};
