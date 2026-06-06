import apiClient from '@/utils/api-client';
import type { StaffStats, StaffDailyOverview } from '@/types/staff';
import type { Booking } from '@/types/booking';

/**
 * Get recent bookings for the staff
 */
export const getStaffRecentBookings = async (): Promise<Booking[]> => {
  try {
    const response = await apiClient.getStaffRecentBookings();
    return response;
  } catch (error: any) {
    console.error('Error fetching staff recent bookings:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Get staff stats
 */
export const getStaffStats = async (): Promise<StaffStats> => {
  try {
    const response = await apiClient.getStaffDashboardStats();
    return response;
  } catch (error: any) {
    console.error('Error fetching staff stats:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Get staff daily overview
 */
export const getStaffDailyOverview = async (): Promise<StaffDailyOverview> => {
  try {
    const response = await apiClient.getStaffDailyOverview();
    return response;
  } catch (error: any) {
    console.error('Error fetching staff daily overview:', error);
    throw error.response?.data ?? error.message;
  }
};
