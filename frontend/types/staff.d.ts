export interface StaffStats {
  totalRevenue: number;
  activeBookings: number;
  totalCustomers: number;
  pendingPayments: number;
}

export interface StaffDailyOverview {
  newBookings: number;
  completedBookings: number;
  inProgressBookings: number;
  revenueToday: number;
}
