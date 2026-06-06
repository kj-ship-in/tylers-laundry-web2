import apiClient from '@/utils/api-client';
import type { CustomerStats } from '@/types/customer';
import type { Booking } from '@/types/booking';

/**
 * Get recent bookings for the customer
 */
export const getRecentBookings = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get<Booking[]>(
      '/dashboard/customer/recent-bookings',
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching recent bookings:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Get upcoming bookings for the customer
 */
export const getUpcomingBookings = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.get<Booking[]>(
      '/dashboard/customer/upcoming-bookings',
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching upcoming bookings:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Get customer stats
 */
export const getCustomerStats = async (): Promise<CustomerStats> => {
  try {
    const response = await apiClient.get<CustomerStats>(
      '/dashboard/customer/stats',
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching customer stats:', error);
    throw error.response?.data ?? error.message;
  }
};
