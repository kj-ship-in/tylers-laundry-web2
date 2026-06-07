'use client';

import React, { useMemo, useState } from 'react';
import { DollarSign, Package, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminStatsGrid } from '@/components/dashboard/AdminStatsGrid';
import {
  useCustomerRecentBookings,
  useCustomerUpcomingBookings,
  useCustomerStats,
} from '@/hooks/useCustomerDashboardQueries';
import RecentBookings from '@/components/dashboard/RecentBookings';
import { BookingsSkeleton } from '@/components/loadings/bookings-skeleton';
import NoData from '@/components/no -data';
import { CustomerTestimonialsSection } from '@/components/testimonials/CustomerTestimonialsSection';
import BookingDrawer from '@/components/drawer/BookingDrawer';

const CustomerDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: recentBookings, isLoading: recentLoading } =
    useCustomerRecentBookings();
  const {
    data: upcomingBookings,
    isLoading: upcomingLoading,
    refetch: refetchUpcoming,
  } = useCustomerUpcomingBookings();
  const { data: stats, isLoading: statsLoading } = useCustomerStats();

  const statsCards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: 'Total Bookings',
        value: stats.totalBookings,
        icon: Package,
      },
      {
        title: 'Active Bookings',
        value: stats.activeBookings,
        icon: Clock,
      },
      {
        title: 'Pending Payments',
        value: stats.pendingPayments,
        icon: DollarSign,
      },
      {
        title: 'Total Spent',
        value: `GMD ${stats.totalSpent}`,
        icon: DollarSign,
      },
    ];
  }, [stats]);

  return (
    <>
      <BookingDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      <div className='space-y-6'>
        {/* Stats Grid */}
        <AdminStatsGrid stats={statsCards} isLoading={statsLoading} />

        <div className='space-y-6'>
          {/* Recent Bookings */}
          <div className='w-full'>
            <RecentBookings
              bookings={recentBookings ?? []}
              isLoading={recentLoading}
              onAdd={() => setDrawerOpen(true)}
            />
          </div>

          {/* Upcoming Bookings */}
          <div className='w-full grid md:grid-cols-2 gap-6'>
            <Card className='w-full'>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
              </CardHeader>
              <CardContent className='w-full'>
                {upcomingLoading ? (
                  <BookingsSkeleton count={3} />
                ) : upcomingBookings && upcomingBookings.length > 0 ? (
                  <div className='space-y-4'>
                    {upcomingBookings.map(booking => (
                      <div key={booking._id} className='p-4 border rounded-lg'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <h4 className='font-medium'>
                              {booking.service.title}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              {new Date(booking.date).toLocaleDateString()}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {booking.status}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='font-medium'>
                              GMD {booking.totalAmount}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='w-full'>
                    <NoData
                      compact
                      title='No Upcoming Bookings'
                      description="You don't have any upcoming bookings at the moment."
                      showRefresh={false}
                      onRefresh={refetchUpcoming}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Reviews */}
            <CustomerTestimonialsSection showHeader compact />
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;
