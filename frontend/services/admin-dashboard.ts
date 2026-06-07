import type {
  AdminDashboardCharts,
  AdminDashboardStats,
  DailyOverview,
  StaffPerformance,
  StaffWorkload,
  StaffEfficiencyMetrics,
} from '@/types/admin';
import type { Booking } from '@/types/booking';
import apiClient from '@/utils/api-client';

/**
 * Get all admin dashboard stats
 */
export const getAllAdminDashboardStats =
  async (): Promise<AdminDashboardStats> => {
    try {
      const response =
        await apiClient.get<AdminDashboardStats>('/reports/dashboard');
      console.log('Dashboard stats response:', response.data);
      return (
        response.data || {
          totalRevenue: 0,
          monthlyRevenue: 0,
          activeBookings: 0,
          totalCustomers: 0,
          pendingPayments: 0,
        }
      );
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      return {
        monthlyRevenue: 0,
        activeBookings: 0,
        totalCustomers: 0,
        pendingPayments: 0,
        completedBookings: 0,
        recentPayments: [],
        totalBookings: 0,
        pendingBookings: 0,
        unpaidInvoices: 0,
        yearlyRevenue: 0,
      };
    }
  };

/**
 * Get recent bookings (admin/staff only)
 */
export const getRecentBookings = async (
  limit: number = 10,
): Promise<Booking[]> => {
  const response = await apiClient.get<Booking[]>(
    '/admin/dashboard/recent-bookings',
    {
      params: { limit },
    },
  );
  console.log('✅ Recent bookings response:', response.data);
  return response.data;
};

/**
 * Get daily overview
 */
export const getDailyOverview = async (): Promise<DailyOverview> => {
  const response = await apiClient.get<DailyOverview>(
    '/admin/dashboard/daily-overview',
  );
  console.log('Daily overview response:', response.data);
  return response.data;
};

export const getRevenueChart = async (): Promise<DailyOverview> => {
  try {
    const response = await apiClient.get<DailyOverview>(
      '/reports/charts/revenue-line',
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching daily overviews:', error);
    throw error.response?.data ?? error.message;
  }
};

export const getServiceRevenueDonut = async (): Promise<DailyOverview> => {
  try {
    const response = await apiClient.get<DailyOverview>(
      '/reports/charts/revenue-line',
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching daily overviews:', error);
    throw error.response?.data ?? error.message;
  }
};

export const getAllCharts = async (): Promise<AdminDashboardCharts> => {
  try {
    const response = await apiClient.get<AdminDashboardCharts>(
      '/reports/charts/all',
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all charts:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Get staff performance metrics
 */
export const getStaffPerformance = async (): Promise<StaffPerformance[]> => {
  try {
    const response = await apiClient.get<StaffPerformance[]>(
      '/reports/staff/performance',
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching staff performance:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Get staff workload data
 */
export const getStaffWorkload = async (): Promise<StaffWorkload> => {
  try {
    const response = await apiClient.get<StaffWorkload>(
      '/reports/staff/workload',
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching staff workload:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Get staff efficiency metrics
 */
export const getStaffEfficiency = async (
  startDate?: string,
  endDate?: string,
): Promise<StaffEfficiencyMetrics[]> => {
  try {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get<StaffEfficiencyMetrics[]>(
      '/reports/staff/efficiency',
      { params },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching staff efficiency:', error);
    throw error.response?.data ?? error.message;
  }
};

/**
 * Update role permissions
 */
export const updateRolePermissions = async (
  role: string,
  permissions: string[],
) => {
  try {
    const response = await apiClient.patch(`/admin/roles/${role}/permissions`, {
      permissions,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating role permissions:', error);
    throw error.response?.data ?? error.message;
  }
};
