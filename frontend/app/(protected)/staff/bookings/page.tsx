'use client';

import React, { useState } from 'react';
import DataTable from '@/components/table/DataTable';
import { Button } from '@/components/ui/button';
import {
  useFetchAllBookings,
  useUpdateBookingStatus,
} from '@/hooks/useBookingsQuery';
import type { Booking } from '@/types/booking.d';
import { Badge } from '@/components/ui/badge';
import UpdateBookingStatusDialog from '@/components/dialog/UpdateBookingStatusDialog';

const TERMINAL_STATUSES = new Set(['COMPLETED', 'DELIVERED', 'CANCELLED']);

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-orange-100 text-orange-800 border-orange-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  DELIVERED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const BookingsPage = () => {
  const { data, isLoading, error } = useFetchAllBookings();
  const updateStatusMutation = useUpdateBookingStatus();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<Booking['status']>('PENDING');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleUpdateStatus = () => {
    if (!selectedBooking) return;
    updateStatusMutation.mutate(
      { bookingId: selectedBooking._id.toString(), status: newStatus },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedBooking(null);
        },
      },
    );
  };

  const columns: Array<{
    key?: keyof Booking;
    title: string;
    width?: string;
    className?: string;
    render?: (value: any, row?: Booking, index?: number) => React.ReactNode;
  }> = [
    {
      title: '#No',
      width: '60px',
      render: (_: any, __: any, index?: number) => (
        <div className='text-start text-slate-600'>
          {((index ?? 0) + 1).toString().padStart(2, '0')}
        </div>
      ),
    },
    {
      title: 'Customer',
      render: (_: any, row?: Booking) => row?.user?.name ?? 'N/A',
    },
    {
      title: 'Service',
      render: (_: any, row?: Booking) => row?.service?.title ?? 'N/A',
    },
    {
      key: 'date' as keyof Booking,
      title: 'Date',
      className: 'whitespace-nowrap',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'pickupTime' as keyof Booking,
      title: 'Pickup Time',
      className: 'whitespace-nowrap',
    },
    {
      key: 'pickupAddress' as keyof Booking,
      title: 'Pickup Address',
      width: '160px',
      render: (value: string) => (
        <span className='block max-w-[140px] truncate' title={value}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'deliveryAddress' as keyof Booking,
      title: 'Delivery Address',
      width: '160px',
      render: (value: string) => (
        <span
          className='block max-w-[140px] truncate'
          title={value || 'Same as pickup'}
        >
          {value || 'Same as pickup'}
        </span>
      ),
    },
    {
      key: 'totalAmount' as keyof Booking,
      title: 'Total',
      className: 'whitespace-nowrap',
      render: (value: string | number) => `GMD ${value}`,
    },
    {
      key: 'status' as keyof Booking,
      title: 'Status',
      className: 'whitespace-nowrap',
      render: (value: Booking['status']) => (
        <Badge className={STATUS_COLORS[value] ?? 'bg-gray-100 text-gray-800'}>
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      title: 'Actions',
      render: (_: any, row?: Booking) => {
        if (!row) return null;
        if (TERMINAL_STATUSES.has(row.status)) {
          return <span className='text-gray-400 text-sm'>Finalized</span>;
        }
        return (
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              setSelectedBooking(row);
              setNewStatus(row.status);
              setDialogOpen(true);
            }}
          >
            Update Status
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
    <div className='space-y-4'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Bookings</h1>
        <p className='text-gray-500 text-sm mt-1'>
          Manage and update the status of customer bookings.
        </p>
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

      <UpdateBookingStatusDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedBooking={selectedBooking}
        newStatus={newStatus}
        onStatusChange={setNewStatus}
        onUpdate={handleUpdateStatus}
        isUpdating={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default BookingsPage;
