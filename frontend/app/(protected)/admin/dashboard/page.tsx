'use client';

import React, { useMemo, useState } from 'react';
import {
  DollarSign,
  Package,
  Users,
  FileText,
  Plus,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminStatsGrid } from '@/components/dashboard/AdminStatsGrid';
import {
  useAdminDashboardStats,
  useRecentBookings,
  useStaffPerformance,
  useStaffWorkload,
  useStaffEfficiency,
} from '@/hooks/useAdminDashboardQueries';
import RecentBookings from '@/components/dashboard/RecentBookings';
import TodaysOverview from '@/components/dashboard/TodaysOverview';
import ServicesPerformance from '@/components/dashboard/ServicesPerformance';
import NoData from '@/components/no -data';
import AddBookingDialog from '@/components/dialog/AddBookingDialog';
import SchedulePickupDialog from '@/components/dialog/SchedulePickupDialog';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { useFetchServiceStats } from '@/hooks/useServicesQuery';
import { usePermissions } from '@/hooks/usePermissions';

const Dashboard = () => {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { data: dashboardStats, isFetching: statsLoading } =
    useAdminDashboardStats();
  const { data: servicesStats, isFetching: servicesLoading } =
    useFetchServiceStats();

  const { hasPermission } = usePermissions();

  const {
    data: bookings,
    isFetching: isLoading,
    isError,
    error,
  } = useRecentBookings(10);

  const {
    data: staffPerformance,
    isFetching: staffPerformanceLoading,
    refetch: refetchStaffPerformance,
  } = useStaffPerformance();

  const {
    data: staffWorkload,
    isFetching: staffWorkloadLoading,
    refetch: refetchStaffWorkload,
  } = useStaffWorkload();

  // Calculate date range for efficiency metrics
  const dateRange = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const endDate = today.toISOString().split('T')[0];
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    return { startDate, endDate };
  }, []);

  const {
    data: staffEfficiency,
    isFetching: staffEfficiencyLoading,
    refetch: refetchStaffEfficiency,
  } = useStaffEfficiency(dateRange.startDate, dateRange.endDate);

  // Transform API data to stats format
  const stats = useMemo(() => {
    if (!dashboardStats) return [];

    return [
      {
        title: 'Total Revenue',
        value: `GMD ${dashboardStats.monthlyRevenue || 0}`,
        icon: DollarSign,
        color: 'from-green-500 to-emerald-600',
      },
      {
        title: 'Active Bookings',
        value: dashboardStats.activeBookings || 0,
        icon: Package,
        color: 'from-blue-500 to-blue-600',
      },
      {
        title: 'Total Customers',
        value: dashboardStats.totalCustomers || 0,
        icon: Users,
        color: 'from-orange-500 to-yellow-500',
      },
      {
        title: 'Pending Payments',
        value: dashboardStats.pendingPayments || 0,
        icon: FileText,
        color: 'from-purple-500 to-pink-500',
      },
    ];
  }, [dashboardStats]);

  return (
    <>
      {/* Stats Grid */}
      <AdminStatsGrid stats={stats} isLoading={statsLoading} />

      <div className='grid grid-cols-1 lg:grid-cols-10 gap-4 lg:gap-6 mb-8'>
        {/* Recent Bookings (approx 80%) */}
        <RecentBookings
          bookings={bookings ?? []}
          isLoading={isLoading}
          error={error?.message}
        />

        {/* Right column: Quick Actions & Today's Overview (approx 20%) */}
        <div className='lg:col-span-2 space-y-4 lg:space-y-6'>
          {/* Quick Actions */}
          <Card className='w-full bg-white rounded-xl shadow-sm border border-gray-200'>
            <CardHeader>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                Quick Actions
              </h3>
            </CardHeader>
            <CardContent className='space-y-3'>
              {hasPermission('booking:create:for:client') && (
                <Button
                  className='w-full flex items-center gap-3 px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition'
                  onClick={() => setIsBookingDialogOpen(true)}
                >
                  <Plus size={20} />
                  <span className='font-medium'>New Booking</span>
                </Button>
              )}
              {hasPermission('service:create') && (
                <Button className='w-full flex items-center gap-3 px-4 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:shadow-lg transition'>
                  <Plus size={20} />
                  <span className='font-medium'>Add Service</span>
                </Button>
              )}
              {hasPermission('pdf:generate:report') && (
                <Button className='w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-blue-500 hover:bg-white hover:text-gray-900 transition'>
                  <FileText size={20} />
                  <span className='font-medium'>Generate Report</span>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Today's Overview */}
          <TodaysOverview />
        </div>
      </div>

      {/* Services Performance */}
      <ServicesPerformance
        services={servicesStats ?? []}
        isLoading={servicesLoading}
      />

      {/* Staff Performance */}
      <div className='mt-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
          Staff Performance
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {staffPerformanceLoading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <Card
                key={i}
                className='bg-white rounded-xl shadow-sm border border-gray-200'
              >
                <CardContent className='p-6'>
                  <div className='w-full h-4 bg-gray-200 rounded animate-pulse mb-4' />
                  <div className='w-3/4 h-6 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='w-1/2 h-4 bg-gray-200 rounded animate-pulse' />
                </CardContent>
              </Card>
            ))
          ) : Array.isArray(staffPerformance) && staffPerformance.length > 0 ? (
            staffPerformance.slice(0, 6).map(staff => (
              <Card
                key={staff.staffId}
                className='bg-white rounded-xl shadow-sm border border-gray-200'
              >
                <CardHeader>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {staff.staffName}
                  </h3>
                  <p className='text-sm text-gray-600'>{staff.staffEmail}</p>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>
                        Total Bookings:
                      </span>
                      <span className='font-medium'>{staff.totalBookings}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>Completed:</span>
                      <span className='font-medium text-green-600'>
                        {staff.completedBookings}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>
                        Completion Rate:
                      </span>
                      <span className='font-medium'>
                        {staff.completionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>
                        Monthly Revenue:
                      </span>
                      <span className='font-medium'>
                        GMD {staff.monthlyRevenue}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className='col-span-full bg-white rounded-xl shadow-sm border border-gray-200'>
              <CardContent className='p-6'>
                <NoData
                  compact
                  title='No Staff Performance Data'
                  description='No staff performance data available at the moment.'
                  onRefresh={refetchStaffPerformance}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Staff Workload */}
      <div className='mt-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
          Staff Workload
        </h2>
        {staffWorkloadLoading ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card className='bg-white rounded-xl shadow-sm border border-gray-200'>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  <div className='w-full h-4 bg-gray-200 rounded animate-pulse' />
                  <div className='w-3/4 h-4 bg-gray-200 rounded animate-pulse' />
                  <div className='w-1/2 h-4 bg-gray-200 rounded animate-pulse' />
                </div>
              </CardContent>
            </Card>
            <Card className='bg-white rounded-xl shadow-sm border border-gray-200'>
              <CardContent className='p-6'>
                <div className='space-y-3'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className='w-full h-12 bg-gray-200 rounded animate-pulse'
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : staffWorkload &&
          Array.isArray(staffWorkload.staffWorkload) &&
          staffWorkload.staffWorkload.length > 0 ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card className='bg-white rounded-xl shadow-sm border border-gray-200'>
              <CardHeader>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Current Workload Overview
                </h3>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>
                      Total Pending Bookings:
                    </span>
                    <span className='font-medium text-orange-600'>
                      {staffWorkload?.totalPendingBookings || 0}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>
                      Total In Progress:
                    </span>
                    <span className='font-medium text-blue-600'>
                      {staffWorkload?.totalInProgressBookings || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white rounded-xl shadow-sm border border-gray-200'>
              <CardHeader>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Individual Workload
                </h3>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {staffWorkload.staffWorkload.slice(0, 4).map(staff => (
                    <div
                      key={staff.staffId}
                      className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'
                    >
                      <div>
                        <p className='font-medium text-sm'>{staff.staffName}</p>
                        <p className='text-xs text-gray-600'>
                          Pending: {staff.pendingBookings} | In Progress:{' '}
                          {staff.inProgressBookings}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium text-sm'>
                          Total: {staff.currentWorkload}
                        </p>
                        <p className='text-xs text-green-600'>
                          Completed Today: {staff.completedToday}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className='bg-white rounded-xl shadow-sm border border-gray-200'>
            <CardContent className='p-6'>
              <NoData
                compact
                title='No Staff Workload Data'
                description='No staff workload data available at the moment.'
                onRefresh={refetchStaffWorkload}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Staff Efficiency */}
      <div className='mt-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
          Staff Efficiency Metrics
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {staffEfficiencyLoading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <Card
                key={i}
                className='bg-white rounded-xl shadow-sm border border-gray-200'
              >
                <CardContent className='p-6'>
                  <div className='w-full h-4 bg-gray-200 rounded animate-pulse mb-4' />
                  <div className='w-3/4 h-6 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='w-1/2 h-4 bg-gray-200 rounded animate-pulse' />
                </CardContent>
              </Card>
            ))
          ) : Array.isArray(staffEfficiency) && staffEfficiency.length > 0 ? (
            staffEfficiency.slice(0, 6).map(staff => (
              <Card
                key={staff.staffId}
                className='bg-white rounded-xl shadow-sm border border-gray-200'
              >
                <CardHeader>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {staff.staffName}
                  </h3>
                  <p className='text-xs text-gray-600'>
                    {staff.period.startDate} - {staff.period.endDate}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>
                        Total Bookings:
                      </span>
                      <span className='font-medium'>{staff.totalBookings}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>
                        Completion Rate:
                      </span>
                      <span className='font-medium'>
                        {staff.completionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>
                        Revenue Generated:
                      </span>
                      <span className='font-medium'>
                        GMD {staff.revenueGenerated}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-600'>Efficiency:</span>
                      <span className='font-medium text-blue-600'>
                        {staff.efficiency.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className='col-span-full bg-white rounded-xl shadow-sm border border-gray-200'>
              <CardContent className='p-6'>
                <NoData
                  compact
                  title='No Staff Efficiency Data'
                  description='No staff efficiency data available at the moment.'
                  onRefresh={refetchStaffEfficiency}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Booking Dialog */}
      <AddBookingDialog
        open={isBookingDialogOpen}
        onOpenChange={setIsBookingDialogOpen}
        onSuccess={message => {
          // You can add a toast notification here
          console.log(message);
        }}
      />

      {/* Schedule Pickup Dialog */}
      <SchedulePickupDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        onSuccess={message => {
          // You can add a toast notification here
          console.log(message);
        }}
      />
    </>
  );
};

export default Dashboard;
