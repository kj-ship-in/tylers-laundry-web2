import {
  getAllAdminDashboardStats,
  getRecentBookings,
  getDailyOverview,
  getRevenueChart,
  getServiceRevenueDonut,
  getAllCharts,
  getStaffPerformance,
  getStaffWorkload,
  getStaffEfficiency,
} from '@/services/admin-dashboard';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

/**
 * Fetch all admin dashboard stats
 */
export const useAdminDashboardStats = () => {
  const { status } = useSession();

  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getAllAdminDashboardStats,
    staleTime: Infinity, // 5 minutes
    enabled: status === 'authenticated',
  });
};

/**
 * Fetch recent bookings for admin dashboard
 */
export const useRecentBookings = (limit: number = 10) => {
  const { status } = useSession();

  return useQuery({
    queryKey: ['recent-bookings', limit],
    queryFn: () => getRecentBookings(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: status === 'authenticated',
  });
};

/**
 * Fetch daily overview data
 */
export const useDailyOverview = () => {
  return useQuery({
    queryKey: ['daily-overview'],
    queryFn: getDailyOverview,
    staleTime: Infinity, // 5 minutes
    enabled: true,
  });
};

/**
 * Fetch revenue chart data
 */
export const useRevenueChart = () => {
  return useQuery({
    queryKey: ['revenue-chart'],
    queryFn: getRevenueChart,
    staleTime: Infinity, // 5 minutes
  });
};

/**
 * Fetch service revenue donut chart data
 */
export const useServiceRevenueDonut = () => {
  return useQuery({
    queryKey: ['service-revenue-donut'],
    queryFn: getServiceRevenueDonut,
    staleTime: Infinity, // 5 minutes
  });
};

/**
 * Fetch all dashboard charts
 */
export const useAllCharts = () => {
  return useQuery({
    queryKey: ['all-charts'],
    queryFn: getAllCharts,
    staleTime: Infinity, // 5 minutes
  });
};

/**
 * Fetch staff performance metrics
 */
export const useStaffPerformance = () => {
  const { status } = useSession();

  return useQuery({
    queryKey: ['staff-performance'],
    queryFn: getStaffPerformance,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: status === 'authenticated',
  });
};

/**
 * Fetch staff workload data
 */
export const useStaffWorkload = () => {
  const { status } = useSession();

  return useQuery({
    queryKey: ['staff-workload'],
    queryFn: getStaffWorkload,
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: status === 'authenticated',
  });
};

/**
 * Fetch staff efficiency metrics
 */
export const useStaffEfficiency = (startDate?: string, endDate?: string) => {
  const { status } = useSession();

  return useQuery({
    queryKey: ['staff-efficiency', startDate, endDate],
    queryFn: () => getStaffEfficiency(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: status === 'authenticated',
  });
};
