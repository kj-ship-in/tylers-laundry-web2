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
import type { Column } from '@/types/table';
import UpdateBookingStatusDialog from '@/components/dialog/UpdateBookingStatusDialog';

const BookingsPage = () => {
  const { data, isLoading, error } = useFetchAllBookings();
  const updateStatusMutation = useUpdateBookingStatus();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<Booking['status']>('PENDING');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleUpdateStatus = () => {
    if (selectedBooking) {
      updateStatusMutation.mutate(
        {
          bookingId: selectedBooking._id.toString(),
          status: newStatus,
        },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setSelectedBooking(null);
          },
        },
      );
    }
  };

  const columns: Column<Booking>[] = [
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
      title: 'Customer Name',
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
      title: 'Total Amount',
      className: 'whitespace-nowrap',
      render: (value: string | number) => `GMD ${value}`,
    },
    {
      key: 'status' as keyof Booking,
      title: 'Status',
      className: 'whitespace-nowrap',
      render: (value: Booking['status']) => {
        const statusColors: Record<string, string> = {
          PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          IN_PROGRESS: 'bg-orange-100 text-orange-800 border-orange-200',
          COMPLETED: 'bg-green-100 text-green-800 border-green-200',
          DELIVERED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          CANCELLED: 'bg-red-100 text-red-800 border-red-200',
        };

        return (
          <Badge className={statusColors[value] ?? 'bg-gray-100 text-gray-800'}>
            {value.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      title: 'Actions',
      render: (_: any, row?: Booking) => {
        if (!row) return null;

        if (['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(row.status)) {
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
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>All Bookings</h1>
          <p className='text-gray-600'>View and manage all service bookings</p>
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
