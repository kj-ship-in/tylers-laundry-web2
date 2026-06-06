import type { ServiceStats } from '@/types/admin';
import type {
  CreateService,
  Service,
  ServiceResponse,
  UpdateService,
} from '@/types/service';
import apiClient from '@/utils/api-client';
import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

if (!BASE_URL) {
  throw new Error('API URL is not defined');
}

export const getAllPublicServices = async (): Promise<Service[]> => {
  const response = await axios.get(`${BASE_URL}/services`);
  if (response.status !== 200) {
    throw new Error('Failed to fetch services');
  }
  return response.data;
};

/**
 * Create a new service
 */
export const createService = async (
  serviceData: CreateService,
): Promise<ServiceResponse> => {
  try {
    const response = await apiClient.post<ServiceResponse>(
      '/services/create',
      serviceData,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating service:', error);
    throw error.response?.data ?? error.message;
  }
};

export const getAllServices = async (): Promise<Service[]> => {
  const response = await apiClient.get('/services/getAll');
  if (response.status !== 200) {
    throw new Error('Failed to fetch services');
  }
  return response.data;
};

export const getServiceOverview = async (): Promise<ServiceStats[]> => {
  const response = await apiClient.get('/services/overview/stats');
  if (response.status !== 200) {
    throw new Error('Failed to fetch services');
  }
  return response.data;
};

/**
 * Get a specific service by ID
 */
export const getServiceById = async (serviceId: string): Promise<Service> => {
  try {
    const response = await apiClient.get<Service>(`/services/get/${serviceId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching service ${serviceId}:`, error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Update a service
 */
export const updateService = async (
  serviceId: string,
  updateData: UpdateService,
): Promise<ServiceResponse> => {
  try {
    const response = await apiClient.put<ServiceResponse>(
      `/services/update/${serviceId}`,
      updateData,
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error updating booking ${serviceId}:`, error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Delete a service
 */
export const deleteService = async (
  serviceId: string,
): Promise<ServiceResponse> => {
  try {
    console.log(
      '🚀 Making DELETE request to:',
      `/services/delete/${serviceId}`,
    );
    const response = await apiClient.delete<ServiceResponse>(
      `/services/delete/${serviceId}`,
    );
    console.log('📡 DELETE response status:', response.status);
    console.log('📡 DELETE response data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error deleting service ${serviceId}:`, error);
    console.error('❌ Error response:', error.response?.data);
    throw error.response?.data ?? error.message;
  }
};
