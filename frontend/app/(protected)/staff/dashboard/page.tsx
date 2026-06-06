'use client';

import React, { useMemo, useState } from 'react';
import {
  DollarSign,
  Package,
  Users,
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useStaffStats,
  useStaffRecentBookings,
  useStaffDailyOverview,
} from '@/hooks/useStaffDashboardQueries';
import { useFetchServiceStats } from '@/hooks/useServicesQuery';
import RecentBookings from '@/components/dashboard/RecentBookings';
import TodaysOverview from '@/components/dashboard/TodaysOverview';
import ServicesPerformance from '@/components/dashboard/ServicesPerformance';
import AddBookingDialog from '@/components/dialog/AddBookingDialog';
import SchedulePickupDialog from '@/components/dialog/SchedulePickupDialog';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/utils/api-client';
import { usePermissions } from '@/hooks/usePermissions';

const StaffDashboard = () => {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { data: dashboardStats, isFetching: statsLoading } = useStaffStats();
  const { data: servicesStats, isFetching: servicesLoading } =
    useFetchServiceStats();

  const {
    data: bookings,
    isFetching: isLoading,
    isError,
    error,
  } = useStaffRecentBookings();

  const {
    data: dailyOverview,
    isFetching: dailyOverviewLoading,
    isError: dailyOverviewError,
    error: dailyOverviewErrorData,
  } = useStaffDailyOverview();

  // Transform API data to stats format
  const stats = useMemo(() => {
    if (!dashboardStats) return [];

    return [
      {
        title: 'Total Revenue',
        value: `GMD ${dashboardStats.totalRevenue || 0}`,
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

  // Check authentication and role
  React.useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== UserRole.STAFF) {
      router.push('/customer/dashboard');
      return;
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500' />
      </div>
    );
  }

  // Don't render if not authenticated or not staff
  if (!session || (session.user as any)?.role !== UserRole.STAFF) {
    return null;
  }

  // Check if we're still loading initial data
  const isInitialLoading = statsLoading || !dashboardStats;

  if (isInitialLoading) {
    return (
      <div className='space-y-6'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Staff Dashboard
          </h1>
          <p className='text-gray-600'>
            Welcome back! Here's an overview of today's activities and your
            tasks.
          </p>
        </div>

        {/* Loading State */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className='bg-white rounded-xl shadow-sm border border-gray-200'
            >
              <CardContent className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-12 h-12 bg-gray-200 rounded-lg animate-pulse' />
                  <div className='w-16 h-4 bg-gray-200 rounded animate-pulse' />
                </div>
                <div className='w-20 h-6 bg-gray-200 rounded animate-pulse mb-2' />
                <div className='w-24 h-4 bg-gray-200 rounded animate-pulse' />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-10 gap-4 lg:gap-6 mb-8'>
          {/* Recent Bookings Loading */}
          <Card className='lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200'>
            <CardHeader>
              <CardTitle className='text-xl font-bold text-gray-900'>
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center space-x-4 p-4 border border-gray-100 rounded-lg'
                  >
                    <div className='w-10 h-10 bg-gray-200 rounded-full animate-pulse' />
                    <div className='flex-1 space-y-2'>
                      <div className='w-32 h-4 bg-gray-200 rounded animate-pulse' />
                      <div className='w-24 h-3 bg-gray-200 rounded animate-pulse' />
                    </div>
                    <div className='w-20 h-6 bg-gray-200 rounded animate-pulse' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Overview Loading */}
          <Card className='lg:col-span-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm text-white'>
            <CardHeader>
              <h3 className='text-lg font-bold mb-4'>Today's Overview</h3>
            </CardHeader>
            <CardContent className='space-y-4'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='w-full flex justify-between items-center flex-row gap-16'
                >
                  <div className='h-6 w-32 flex-1 bg-blue-400 rounded animate-pulse' />
                  <div className='h-6 w-6 bg-blue-400 rounded-full animate-pulse' />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Staff Dashboard
        </h1>
        <p className='text-gray-600'>
          Welcome back! Here's an overview of today's activities and your tasks.
        </p>
      </div>
      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {statsLoading
          ? // Loading skeletons
            [...Array(4)].map((_, i) => (
              <Card
                key={i}
                className='bg-white rounded-xl shadow-sm border border-gray-200'
              >
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='w-12 h-12 bg-gray-200 rounded-lg animate-pulse' />
                    <div className='w-16 h-4 bg-gray-200 rounded animate-pulse' />
                  </div>
                  <div className='w-20 h-6 bg-gray-200 rounded animate-pulse mb-2' />
                  <div className='w-24 h-4 bg-gray-200 rounded animate-pulse' />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, index) => (
              <Card
                key={`${stat.title}-${index}`}
                className='bg-white rounded-xl shadow-sm border border-gray-200'
              >
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div
                      className={`w-12 h-12 bg-linear-to-br ${stat.color} rounded-lg flex items-center justify-center`}
                    >
                      <stat.icon className='text-white' size={24} />
                    </div>
                    <span className='text-sm font-medium text-gray-500'>
                      Today
                    </span>
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 mb-1'>
                    {stat.value}
                  </h3>
                  <p className='text-sm text-gray-600'>{stat.title}</p>
                </CardContent>
              </Card>
            ))}
      </div>

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
              <Button className='w-full flex items-center gap-3 px-4 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition'>
                <CheckCircle size={20} />
                <span className='font-medium'>Update Status</span>
              </Button>

              <Button
                className='w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-blue-500 transition'
                onClick={() => setIsScheduleDialogOpen(true)}
              >
                <Calendar size={20} />
                <span className='font-medium'>My Tasks</span>
              </Button>
            </CardContent>
          </Card>

          {/* Today's Overview */}
          <TodaysOverview
            data={dailyOverview}
            isLoading={dailyOverviewLoading}
            isError={dailyOverviewError}
            error={dailyOverviewErrorData}
          />
        </div>
      </div>

      {/* Services Performance */}
      <ServicesPerformance
        services={servicesStats ?? []}
        isLoading={servicesLoading}
      />

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
    </div>
  );
};

export default StaffDashboard;
