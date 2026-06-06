import type { PaymentMethod, PaymentStatus } from './payment';

interface BaseLineDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension?: number;
  fill?: boolean;
}

interface BaseBarDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor: string | string[];
  borderWidth?: number;
}

interface BaseDonutDataset {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
}

export interface AdminDashboardStats {
  totalCustomers: number;
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
  pendingPayments: number;
  completedBookings: number;
  unpaidInvoices: number;

  monthlyRevenue: number;
  yearlyRevenue: number;

  recentPayments: RecentPayment[];
}

export interface RecentPayment {
  _id: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  currency: string;
  createdAt: string | Date;
  booking: {
    _id: string;
    totalAmount: number;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    service: {
      _id: string;
      title: string;
      type: string;
    };
  };
}

export interface DailyOverview {
  newBookings: number;
  completedBookings: number;
  inProgressBookings: number;
  revenueToday: number;
}

export interface ServiceRevenueDonut {
  labels: string[];
  datasets: [
    BaseDonutDataset & {
      label: 'Revenue by Service (GMD)';
    },
  ];
  details: ServiceRevenueDetail[];
}

export interface RevenueChart {
  labels: string[];
  datasets: BaseLineDataset[];
}

export interface RevenueLineChart {
  labels: string[];
  datasets: [
    BaseLineDataset & {
      label: 'Revenue (GMD)';
    },
    BaseLineDataset & {
      label: 'Bookings';
    },
  ];
}

export interface BookingStatusBar {
  labels: string[];
  datasets: [
    BaseBarDataset & {
      label: 'Number of Bookings';
      borderWidth: 1;
    },
  ];
}

export interface PaymentMethodDetail {
  method: string;
  amount: number;
  count: number;
  color: string;
}

export interface PaymentMethodDonut {
  labels: string[];
  datasets: [
    BaseDonutDataset & {
      label: 'Revenue by Payment Method (GMD)';
    },
  ];
  details: PaymentMethodDetail[];
}

interface BookingStatusDataset {
  label: 'Pending' | 'In Progress' | 'Completed' | 'Delivered' | 'Cancelled';
  data: number[];
  backgroundColor: string;
  borderColor: string;
}

export interface DailyBookingComparison {
  labels: string[];
  datasets: BookingStatusDataset[];
}

export interface CustomerAcquisitionLine {
  labels: string[];
  datasets: [
    BaseLineDataset & {
      label: 'New Customers';
      pointRadius: number;
      pointBackgroundColor: string;
    },
  ];
}

export interface AdminDashboardCharts {
  revenueLineChart: RevenueLineChart;
  bookingStatusBar: BookingStatusBar;
  serviceRevenueDonut: ServiceRevenueDonut;
  paymentMethodDonut: PaymentMethodDonut;
  dailyBookingComparison: DailyBookingComparison;
  customerAcquisitionLine: CustomerAcquisitionLine;
}

export type ServiceType =
  | 'wash-fold'
  | 'dry-clean'
  | 'ironing'
  | 'wash-iron'
  | 'pickup-delivery';

export interface ServiceStats {
  name: string;
  type: ServiceType;
  description: string;

  orders: number;
  basePrice: number;
  totalRevenue: number;
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  staffEmail: string;
  joinDate: Date;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  completionRate: number;
  monthlyBookings: number;
  weeklyBookings: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  averageCompletionTimeHours: number;
}

export interface StaffWorkload {
  totalPendingBookings: number;
  totalInProgressBookings: number;
  staffWorkload: {
    staffId: string;
    staffName: string;
    currentWorkload: number;
    pendingBookings: number;
    inProgressBookings: number;
    completedToday: number;
    completedThisMonth: number;
  }[];
}

export interface StaffEfficiencyMetrics {
  staffId: string;
  staffName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalBookings: number;
  completedBookings: number;
  completionRate: number;
  revenueGenerated: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  efficiency: number;
}
