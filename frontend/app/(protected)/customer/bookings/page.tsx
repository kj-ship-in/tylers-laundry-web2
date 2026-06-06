'use client';

import React, { useState } from 'react';
import DataTable from '@/components/table/DataTable';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useFetchAllBookings,
  useFetchAllMyBookings,
} from '@/hooks/useBookingsQuery';
import type { Booking } from '@/types/booking.d';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/permission';

const BookingsPage = () => {
  const { data, isFetching: isLoading, error } = useFetchAllMyBookings();

  // Permission checks
  const { hasPermission } = usePermissions();

  const columns: Array<{
    key?: keyof Booking;
    title: string;
    width?: string;
    render?: (value: any, row?: Booking, index?: number) => React.ReactNode;
  }> = [
    {
      title: '#No',
      width: '60px',
      render: (_: any, __: any, index?: number) => {
        const rowIndex = (index ?? 0) + 1;
        const formattedIndex = rowIndex.toString().padStart(2, '0');
        return (
          <div className='text-start text-slate-600'>{formattedIndex}</div>
        );
      },
    },
    {
      title: 'Service',
      render: (_: any, row?: Booking) => row?.service?.title ?? 'N/A',
    },
    {
      key: 'date' as keyof Booking,
      title: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'pickupTime' as keyof Booking,
      title: 'Pickup Time',
    },
    {
      key: 'pickupAddress' as keyof Booking,
      title: 'Pickup Address',
    },
    {
      key: 'deliveryAddress' as keyof Booking,
      title: 'Delivery Address',
      render: (value: string) => value || 'Same as pickup',
    },
    {
      key: 'totalAmount' as keyof Booking,
      title: 'Total Amount',
      render: (value: string | number) => `GMD ${value}`,
    },
    {
      key: 'status' as keyof Booking,
      title: 'Status',
      render: (value: Booking['status']) => {
        const statusColors = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          CONFIRMED: 'bg-blue-100 text-blue-800',
          COMPLETED: 'bg-green-100 text-green-800',
          CANCELLED: 'bg-red-100 text-red-800',
        };

        return (
          <Badge className={statusColors[value] ?? 'bg-gray-100 text-gray-800'}>
            {value}
          </Badge>
        );
      },
    },
    {
      title: 'Actions',
      render: (_: any, __?: Booking) => {
        if (!hasPermission('booking:update:own')) {
          return <span className='text-gray-400'>No actions</span>;
        }

        return (
          <Button
            size='sm'
            variant='default'
            className='bg-blue-600 hover:bg-blue-700'
            onClick={() => null}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-800'>
            Error loading bookings: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My Bookings</h1>
          <p className='text-gray-600'>View and manage your service bookings</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        searchPlaceholder='Search bookings...'
        emptyMessage='No bookings found.'
        enableSorting
        enableFiltering
        enablePagination
        pageSize={10}
      />
    </div>
  );
};

export default BookingsPage;
