import { useQuery } from '@tanstack/react-query';
import {
  getStaffRecentBookings,
  getStaffStats,
  getStaffDailyOverview,
} from '@/services/staff-dashboard';
import type { StaffStats, StaffDailyOverview } from '@/types/staff';
import type { Booking } from '@/types/booking';

/**
 * Fetch recent bookings for staff
 */
export const useStaffRecentBookings = () => {
  return useQuery<Booking[]>({
    queryKey: ['staff-recent-bookings'],
    queryFn: getStaffRecentBookings,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch staff stats
 */
export const useStaffStats = () => {
  return useQuery<StaffStats>({
    queryKey: ['staff-stats'],
    queryFn: getStaffStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch staff daily overview
 */
export const useStaffDailyOverview = () => {
  return useQuery<StaffDailyOverview>({
    queryKey: ['staff-daily-overview'],
    queryFn: getStaffDailyOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
