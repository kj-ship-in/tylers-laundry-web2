import { useQuery } from '@tanstack/react-query';
import {
  getRecentBookings,
  getUpcomingBookings,
  getCustomerStats,
} from '@/services/customer-dashboard';
import type { CustomerStats } from '@/types/customer';
import type { Booking } from '@/types/booking';

/**
 * Fetch recent bookings for customer
 */
export const useCustomerRecentBookings = () => {
  return useQuery<Booking[]>({
    queryKey: ['customer-recent-bookings'],
    queryFn: getRecentBookings,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch upcoming bookings for customer
 */
export const useCustomerUpcomingBookings = () => {
  return useQuery<Booking[]>({
    queryKey: ['customer-upcoming-bookings'],
    queryFn: getUpcomingBookings,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch customer stats
 */
export const useCustomerStats = () => {
  return useQuery<CustomerStats>({
    queryKey: ['customer-stats'],
    queryFn: getCustomerStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
